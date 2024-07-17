import './dummydom.js';

import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

import { Component, Page } from '@robertakarobin/util/components/component.ts';
import { Resolver, type RouteMap, Router } from '@robertakarobin/util/web/router.ts';
import type { BaseApp } from '@robertakarobin/util/components/app.ts';
import { baseUrl } from '@robertakarobin/util/web/context.ts';
import { pipeFirst } from '@robertakarobin/util/emitter/pipe/first.ts';
import { posixPath } from '@robertakarobin/util/node/posixPath.ts';
import { promiseConsecutive } from '@robertakarobin/util/time/promiseConsecutive.ts';

const local = (input: string) => path.relative(process.cwd(), input);

const trimNewlines = (input: string) => input.trim().replace(/[\n\r]+/g, ``);

const compilePathsByExportName = {} as Record<string, string>;

const componentsInApp: Record<typeof Component[`elName`], typeof Component> = {};

const stylesByElName = {} as Record<string, string | undefined>;

// Override DOM-dependent methods since these may not be availble during SSR. Doing it here instead of in Component because these methods are run a lot, and we don't have to do an unnecessary `appContext` check each time.
// Have to set Page here too because Page doesn't directly extend Component; it uses Component.custom
// TODO2: Do this in a way that subclasses can still customize `render` and `toString`
Component.prototype.render = Page.prototype.render = function() {
	this.innerHTML = this.template();
	return this;
};

Component.prototype.toString = Page.prototype.toString = function() {
	this.render();
	return this.outerHTML;
};

Resolver.prototype.onPage = async function(to) {
	const page = await this.resolve(to.url) as Page;
	this.set(page);
};

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
		await this.buildStylesForAppRoot();

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

		const componentsInAppRoot = Object.fromEntries(Component.registry.entries());

		const builtRoutes = new Set<string>();

		const ssgRoutes = this.ssgRoutes ?? Object.values(router.routes);

		const routes = ssgRoutes.map(route => async() => {
			Component.registry.clear();

			this.log(`Route ${route}`);
			const routeName = router.findRouteName(route);

			this.log(`Route ${route} matches route ${routeName}`);

			if (typeof route === `function`) {
				this.log(`Route ${route} is a function. Skipping...`);
				this.logBreak();
				return;
			}

			const url = Router.toUrl(route);
			if (url.origin !== baseUrl.origin) {
				this.log(`Route is external. Skipping...`);
				this.logBreak();
				return;
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

			const routePath = path.join(`/`, serveFileRel);

			const page = await new Promise<Page>(resolve => {
				resolver.pipe(pipeFirst()).subscribe(resolve);
				router.go(route);
			});
			app.onPage(page);

			builtRoutes.add(serveFileRel);

			const serveFileAbs = path.join(this.serveDirAbs, serveFileRel);
			const serveDirAbs = path.dirname(serveFileAbs);
			fs.mkdirSync(serveDirAbs, { recursive: true });

			if (page === undefined) {
				this.log(`Route '${routeName}' does not resolve to a page. Skipping...`);
				this.logBreak();
				return;
			}

			const componentsInRoute = {
				...componentsInAppRoot,
				...Object.fromEntries(Component.registry.entries()),
			};

			const routeCssElNames: Array<typeof Component[`elName`]> = [];
			let routeCss = ``;
			for (const Subclass of Object.values(componentsInRoute)) {
				if (Subclass.elName in componentsInApp) {
					continue;
				}

				componentsInApp[Subclass.elName] = Subclass;

				const style = (
					stylesByElName[Subclass.elName] = await this.buildStylesForComponent(Subclass)
				);
				if (typeof style === `string` && style.length > 0) {
					routeCss += style;
					routeCssElNames.push(Subclass.elName);
				}
			}

			if (routeCss.length > 0) {
				routeCss = await this.formatCss(routeCss);
				const routeCssAbs = path.join(this.serveDirAbs, `${serveFileRel}.css`);
				this.log(local(routeCssAbs));
				fs.writeFileSync(routeCssAbs, routeCss);
			}

			const html = await this.formatHtml({
				baseUri: this.baseUri,
				body: app.outerHTML,
				browserScriptPath: this.browserServeFileRel,
				cacheBuster: Component.cacheBust(),
				description: undefined,
				mainCssPath: this.styleServeFileRel,
				routeCss,
				routeCssElNames,
				routePath,
				title: page.pageTitle,
				viewCompilePath: compilePathsByExportName[page.Ctor.name],
				viewCtorName: page.Ctor.name,
			});

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

	async buildStylesForAppRoot() {
		this.logHeader(`Building style file for app root`);

		const styleSrcFile = (await this.bustCache(this.stylesSrcFileAbs)) as { default: string; };

		const styles = await this.formatCss(styleSrcFile.default);
		this.log(local(this.stylesServeFileAbs));
		fs.writeFileSync(this.stylesServeFileAbs, styles);
		this.logBreak();
	}

	async buildStylesForComponent(Subclass: typeof Component) {
		let stylePath = Subclass.stylePath;

		let style = Subclass.style ?? ``;

		if (typeof stylePath === `string`) {
			if (stylePath.endsWith(`.css.ts`) === false) {
				stylePath = stylePath.replace(/\.ts$/, `.css.ts`);
			}

			const styleFile = await import(stylePath) as { default: string; };
			style = `${styleFile.default} ${style}`;
		}

		style = Subclass.formatCss(style);
		style = await this.formatCss(style);

		if (style.length > 0) {
			const targetPath = path.join(this.serveDirAbs, `${Subclass.elName}.css`);
			fs.writeFileSync(targetPath, style);
			this.log(targetPath);
			return style;
		}

		return undefined;
	}

	async buildStylesForRoute() {}

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

	formatHead(input: {
		baseUri: string;
		browserScriptPath: string | undefined;
		cacheBuster: string;
		description: string | undefined;
		mainCssPath: string;
		routeCss: string;
		routeCssElNames: Array<string>;
		routePath: string;
		title: string;
		viewCompilePath: string;
		viewCtorName: string;
	}) {
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

		${typeof input.routeCss === `string` && input.routeCss.length > 0
			? /*html*/`
				<link
					${input.routeCssElNames.map(elName => `data-${elName}`).join(` `)}
					href="${input.routePath}.css${input.cacheBuster ?? ``}"
					rel="stylesheet"
				/>`
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
	`;
	}

	formatHtml(input: Parameters<Builder[`formatHead`]>[0] & {
		body: string;
	}): Promise<string> | string {
		const head = this.formatHead(input);
		let html = `
<!DOCTYPE html>
<html lang="en">
	<head>${head}</head>
	${input.body}
</html>`;
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
