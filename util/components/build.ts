import '@robertakarobin/util/dom/dummydom.ts';

import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

import { Component, type Page } from '@robertakarobin/util/components/component.ts';
import { Resolver, type RouteMap, Router } from '@robertakarobin/util/web/router.ts';
import type { BaseApp } from '@robertakarobin/util/components/app.ts';
import { baseUrl } from '@robertakarobin/util/web/context.ts';
import { pipeFirst } from '@robertakarobin/util/emitter/pipe/first.ts';
import { posixPath } from '@robertakarobin/util/node/posixPath.ts';
import { promiseConsecutive } from '@robertakarobin/util/time/promiseConsecutive.ts';

const local = (input: string) => path.relative(process.cwd(), input);

const trimNewlines = (input: string) => input.trim().replace(/[\n\r]+/g, ``);

const compilePathsByExportName = {} as Record<string, string>;

Resolver.prototype.onPage = async function(to, { previous }) {
	this.set(await this.resolve(to.url, previous?.url));
};

/**
 * `npm i @robertakarobin/util-components-build-deps`
 */
export class Builder {
	readonly appSrcFileAbs: string;
	readonly appSrcFileRel: string;
	readonly assetsSrcDirRel: Array<string> | string;
	readonly baseDirAbs: string;
	readonly baseUri: string;
	readonly browserServeFileAbs: string | undefined;
	readonly browserServeFileName: string | undefined;
	readonly browserServeFileRel: string | undefined;
	readonly browserSrcFileAbs: string | undefined;
	readonly browserSrcFileRel: string | undefined;
	esbuildOverride: Partial<esbuild.BuildOptions>;
	esbuildServeOverride: Partial<esbuild.ServeOptions>;
	readonly metaFileRel: string | undefined;
	readonly quiet: boolean;
	readonly serveDirAbs: string;
	readonly srcDirAbs: string;
	readonly ssgRoutes?: Array<string>;
	readonly styleServeFileRel: string;
	readonly stylesServeFileAbs: string;
	readonly stylesSrcFileAbs: string;
	readonly tsconfigFileAbs: string | undefined;

	/**
	*
	* @param input
	* @param input.assetsSrcDirRel The relative path/paths to directories that should be copied to the `dist/` folder
	* @param input.baseDirAbs The root directory for this project. Determines where the Builder looks for other files. Defaults to `process.cwd()`
	* @param input.baseUri The base URL used when defining routes
	* @param input.browserSrcFileRel Relative path to the JS script that will be run when a page loads, e.g. the "entry point" for CSR bootstrapping. Not needed for apps that are SSG-only
	* @param input.minify Sets ESBuild's `minify` option
	* @param input.routerSrcFileRel Relative path to the file containing the router, resolver, and renderer. Defaults to `./router.ts`
	* @param input.serveDirRel Relative path to the directory from which the application will be served. Defaults to `./dist`
	* @param input.srcRawDirRel Relative path to the source code. Defaults to `./src`
	* @param input.styleServeFileRel Relative path to the root CSS file that will be loaded on all pages. Defaults to `./styles.css`
	*/
	constructor(input: Partial<{
		appSrcFileRel: string;
		assetsSrcDirRel: Array<string> | string;
		baseDirAbs: string;
		baseUri: string;
		browserSrcFileRel: string | undefined;
		esbuild: Partial<esbuild.BuildOptions>;
		esbuildServe: Partial<esbuild.ServeOptions>;
		metaFileRel: string;
		quiet: boolean;
		serveDirRel: string;
		srcDirRel: string;
		ssgRoutes: Array<string>;
		styleServeFileRel: string;
		tsconfigFileRel: string;
	}> = {}) {
		this.esbuildOverride = input.esbuild ?? {};
		this.esbuildServeOverride = input.esbuildServe ?? {};

		this.quiet = input.quiet ?? false;

		this.baseUri = input.baseUri ?? `/`;

		this.baseDirAbs = posixPath(input.baseDirAbs ?? process.cwd());
		this.serveDirAbs = path.join(this.baseDirAbs, input.serveDirRel ?? `./dist`);
		this.srcDirAbs = path.join(this.baseDirAbs, input.srcDirRel ?? `./src`);
		this.tsconfigFileAbs = path.join(process.cwd(), input.tsconfigFileRel ?? `tsconfig.json`);

		this.assetsSrcDirRel = input.assetsSrcDirRel ?? `./assets`;

		this.metaFileRel = input.metaFileRel;

		this.appSrcFileRel = input.appSrcFileRel ?? `./app.ts`;
		this.appSrcFileAbs = path.join(this.srcDirAbs, this.appSrcFileRel);
		this.ssgRoutes = input.ssgRoutes;

		this.browserSrcFileRel = input.browserSrcFileRel ?? `./browser.ts`;
		if (this.browserSrcFileRel !== undefined) {
			this.browserSrcFileAbs = path.join(this.srcDirAbs, this.browserSrcFileRel);
			this.browserServeFileName = path.parse(this.browserSrcFileRel).name;
			this.browserServeFileAbs = path.join(this.serveDirAbs, this.browserSrcFileRel);
			this.browserServeFileRel = path.relative(this.serveDirAbs, `${this.browserServeFileName}.js`);
		}

		this.styleServeFileRel = input.styleServeFileRel ?? `./styles.css`;
		this.stylesSrcFileAbs = path.join(this.srcDirAbs, `${this.styleServeFileRel}.ts`);
		this.stylesServeFileAbs = path.join(this.serveDirAbs, this.styleServeFileRel);
	}

	async build(input: { serve?: boolean; } = {}) {
		fs.rmSync(this.serveDirAbs, { force: true, recursive: true });
		fs.mkdirSync(this.serveDirAbs);

		await this.buildAssets();
		await this.buildScript();
		await this.buildRoutes();
		await this.buildStyles();
		await this.buildStyleFiles();

		await this.cleanup();

		if (input.serve === true) {
			this.serve(this.esbuildServeOverride);
		}
	}

	buildAssets(): Promise<void> | void {
		this.logHeader(`Building assets`);
		const assetsSrcDirRels = typeof this.assetsSrcDirRel === `string`
			?	[this.assetsSrcDirRel]
			:	this.assetsSrcDirRel;
		for (const assetsSrcDirRel of assetsSrcDirRels) {
			const assetsSrcDirAbs = path.join(this.baseDirAbs, assetsSrcDirRel);
			const assetsServeDirAbs = path.join(this.serveDirAbs, assetsSrcDirRel);
			if (fs.existsSync(assetsSrcDirAbs)) {
				this.log(local(assetsServeDirAbs));
				fs.cpSync(assetsSrcDirAbs, assetsServeDirAbs, { recursive: true });
			}
		}
		this.logBreak();
	}

	async buildRoutes() {
		this.logHeader(`Building routes`);

		const { App } = await import(this.appSrcFileAbs) as { App: new() => BaseApp<RouteMap>; };
		const app = new App();
		const { resolver, router } = app;

		const appStyles = document.head.querySelectorAll(`[${Component.const.styleAttr}]`);
		const appStyleFiles = document.head.querySelectorAll(`link`);

		document.body.replaceWith(app);
		document.documentElement.lang = `en`;

		const builtRoutes = new Set<string>();

		const ssgRoutes = this.ssgRoutes ?? Object.values(router.routes);

		const routes = ssgRoutes.map(route => async() => {
			this.log(`Route ${route}`);

			const routeName = router.findRouteName(route);

			this.log(`Route ${route} matches route ${routeName}`);

			if (typeof route === `function`) {
				this.log(`Route ${route} is a function. Skipping...`);
				this.logBreak();
				return;
			}

			const url = new URL(route, baseUrl);
			if (url.origin !== baseUrl.origin) {
				this.log(`Route is external. Skipping...`);
				this.logBreak();
				return;
			}

			document.head.replaceChildren();
			for (const appStyle of appStyles) {
				document.head.appendChild(appStyle.cloneNode(true));
			}
			for (const appStyleFile of appStyleFiles) {
				document.head.appendChild(appStyleFile.cloneNode(true));
			}

			url.hash = ``;
			if (Router.hasExtension.test(url.pathname) === false) {
				url.pathname += `/index.html`;
			}

			const serveFileRel = url.pathname;
			if (builtRoutes.has(serveFileRel)) {
				this.log(`Route '${routeName}' matches already-built route. Skipping...`);
				this.logBreak();
				return;
			}

			const page = await new Promise<Page>(resolve => {
				resolver.pipe(pipeFirst()).subscribe(resolve);
				router.go(route);
			});

			builtRoutes.add(serveFileRel);

			const serveFileAbs = path.join(this.serveDirAbs, serveFileRel);
			const serveDirAbs = path.dirname(serveFileAbs);
			fs.mkdirSync(serveDirAbs, { recursive: true });

			if (page === undefined) {
				this.log(`Route '${routeName}' does not resolve to a page. Skipping...`);
				this.logBreak();
				return;
			}

			let routeCss = ``;
			let routeCssPath = ``;
			for (const style of document.head.querySelectorAll(`style`)) {
				routeCss += style.textContent?.trim() ?? ``;
				style.textContent = ``;
			}

			if (routeCss.length > 0) {
				routeCss = await this.formatCss(routeCss);
				routeCssPath = `${serveFileRel}.css`;
				const routeCssAbs = path.join(this.serveDirAbs, routeCssPath);
				this.log(local(routeCssAbs));
				fs.writeFileSync(routeCssAbs, routeCss);
			}

			document.head.innerHTML = this.formatHead({
				baseUri: this.baseUri,
				browserScriptPath: this.browserServeFileRel,
				cacheBuster: Component.cacheBust(),
				mainCssPath: this.styleServeFileRel,
				routeCss,
				routeCssPath,
				title: document.title,
				viewCompilePath: compilePathsByExportName[page.Ctor.name],
				viewCtorName: page.Ctor.name,
			});

			const html = await this.formatHtml(`<!DOCTYPE html>` + this.formatDocument(document));

			this.log(local(serveFileAbs));
			fs.writeFileSync(serveFileAbs, html);
			this.logBreak();
		});

		await promiseConsecutive(routes);
	}

	async buildScript() {
		if (this.browserServeFileAbs === undefined) {
			return;
		}
		this.logHeader(`Bundling JS`);
		this.log(local(this.browserServeFileAbs));
		this.logBreak();

		const buildOptions: esbuild.BuildOptions = {
			absWorkingDir: this.serveDirAbs,
			bundle: true,
			entryPoints: [{
				in: this.browserSrcFileAbs!,
				out: this.browserServeFileName!,
			}],
			format: `esm`,
			keepNames: true,
			metafile: true, // Required for compilePaths
			outdir: this.serveDirAbs,
			splitting: true,
			tsconfig: this.tsconfigFileAbs, // I thought esbuild would figure this out by itself, but when this isn't specified it does all kinds of weird behavior like not transpiling decorators
			...this.esbuildOverride,
		};

		const buildResults = await esbuild.build(buildOptions)
		;
		if (this.metaFileRel !== undefined) {
			const metaFileAbs = path.join(this.serveDirAbs, this.metaFileRel);
			this.logHeader(`Outputting metafile`);
			this.log(local(metaFileAbs));
			fs.writeFileSync(metaFileAbs, JSON.stringify(buildResults.metafile));
			this.logBreak();
		}
		for (const filepath in buildResults.metafile!.outputs) {
			const output = buildResults.metafile!.outputs[filepath];
			for (const exportName of output.exports) {
				compilePathsByExportName[exportName] = filepath;
			}
		}
	}

	async buildStyleFiles() {
		const Components = [...Component.registry.values()];
		await promiseConsecutive(Components.map(Subclass => async() => {
			if (typeof Subclass.stylePath !== `string`) {
				return;
			}

			let stylePath = Subclass.stylePath;
			if (stylePath.endsWith(`.css.ts`) === false) {
				stylePath = stylePath.replace(/\.ts$/, `.css.ts`);
			}

			const styleFile = await import(stylePath) as { default: string; };
			let style = styleFile.default;
			style = Subclass.formatCss(style);
			style = await this.formatCss(style);

			const targetPath = path.join(this.serveDirAbs, `${Subclass.elName}.css`);
			fs.writeFileSync(targetPath, style);
		}));
	}

	async buildStyles() {
		this.logHeader(`Building root styles`);
		let styles = (await this.bustCache(this.stylesSrcFileAbs)).default as string; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		styles = await this.formatCss(styles);
		this.log(local(this.stylesServeFileAbs));
		fs.writeFileSync(this.stylesServeFileAbs, styles);
		this.logBreak();
	}

	bustCache(pathname: string) {
		const url = new URL(`file:///${pathname}?v=${Date.now() + performance.now()}`); // URL is necessary for running on Windows
		return import(url.toString());
	};

	cleanup(): Promise<void> | void {}

	formatCss(input: string): Promise<string> | string {
		let css = input;
		css = trimNewlines(input);
		return css;
	}

	formatDocument(document: Document) {
		return document.documentElement.outerHTML;
	}

	formatHead(input: Partial<{
		baseUri: string;
		browserScriptPath: string;
		cacheBuster: string;
		description: string;
		mainCssPath: string;
		routeCss: string;
		routeCssPath: string;
		title: string;
		viewCompilePath: string;
		viewCtorName: string;
	}> = {}) {
		return /*html*/`
		<meta charset="utf-8">
		<meta name="description" content="${input.description ?? input.title ?? ``}">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

		${typeof input.title === `string`
			? /*html*/`<title>${input.title}</title>`
			: ``
		}

		${typeof input.baseUri === `string`
			? /*html*/`<base href="${input.baseUri}">`
			: ``
		}

		${typeof input.mainCssPath === `string`
			? /*html*/`<link rel="stylesheet" href="${path.join(`/`, input.mainCssPath)}${input.cacheBuster ?? ``}">`
			: ``
		}

		${typeof input.routeCssPath === `string` && typeof input.routeCss === `string` && input.routeCss.length > 0
			? /*html*/`<link rel="stylesheet" href="${path.join(`/`, input.routeCssPath)}${input.cacheBuster ?? ``}">`
			: ``
		}

		${typeof input.browserScriptPath === `string`
			? /*html*/`<script src="${path.join(`/`, input.browserScriptPath)}${input.cacheBuster ?? ``}" type="module"></script>`
			: ``
		}

		${typeof input.viewCtorName === `string` && typeof input.viewCompilePath === `string`
			? /*html*/`<script type="module">import { ${input.viewCtorName} } from '${path.join(`/`, input.viewCompilePath)}';</script>`
			: ``
		}

		${Array.from(document.querySelectorAll(`style`)).map(style => style.outerHTML).join(``)}

		${Array.from(document.querySelectorAll(`link`)).map(styleFile => styleFile.outerHTML).join(``)}
	`;
	}

	formatHtml(input: string): Promise<string> | string {
		let html = input;
		html = trimNewlines(html);
		return html;
	}

	log(...args: Array<string>) {
		if (this.quiet === false) {
			console.log(args.join(`\n`));
		}
	}

	logBreak() {
		if (this.quiet === false) {
			console.log(``);
		}
	}

	logHeader(input: string) {
		if (this.quiet === false) {
			console.log(`...${input}...\n`);
		}
	}

	serve(options: (esbuild.ServeOptions) = {}) {
		const port = isNaN(options.port as number) ? 3000 : options.port;

		let tries = 0;
		const triesMax = 10;

		const retryPort = () => esbuild.context({}).then(context => {
			context.serve({
				port,
				servedir: this.serveDirAbs,
				...options,
			}).then(() => {
				this.logHeader(`Serving`);
				this.log(local(this.serveDirAbs), `http://localhost:${port}`);
				this.logBreak();
			}).catch(() => {
				if (tries >= triesMax) {
					throw new Error(`Tried ${triesMax} times to connect to port ${port}, but couldn't. Is it in use?`);
				}
				tries += 1;
				setTimeout(() => void retryPort(), 100);
			});
		});

		void retryPort();
	}
}
