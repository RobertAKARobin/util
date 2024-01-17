import './dummydom.ts';

import esbuild from 'esbuild';
import fs from 'fs';
import { glob } from 'glob';
import jsBeautify from 'js-beautify';
import { marked } from 'marked';
import path from 'path';

import type * as $ from '@robertakarobin/util/types.d.ts';
import { stringMates, type TagResult } from '@robertakarobin/util/string-mates.ts';
import { baseUrl } from '@robertakarobin/util/context.ts';
import { hasExtension } from '@robertakarobin/util/router.ts';
import { promiseConsecutive } from '@robertakarobin/util/promiseConsecutive.ts';

import type { BaseApp } from './app.ts';
import type { Page } from './component.ts';

const bustCache = (pathname: string) => {
	const url = new URL(`file:///${pathname}?v=${Date.now() + performance.now()}`); // URL is necessary for running on Windows
	return import(url.toString());
};

const header = (input: string) => console.log(`...${input}...\n`);

const local = (input: string) => path.relative(process.cwd(), input);

const log = (...args: Array<string>) => console.log(args.join(`\n`));

const logBreak = () => console.log(``);

const trimNewlines = (input: string) => input.trim().replace(/[\n\r]+/g, ``);

const compilePathsByExportName = {} as Record<string, string>;

export class Builder {
	readonly appSrcFileAbs: string;
	readonly appSrcFileRel: string;
	readonly assetsSrcDirRel: string | Array<string>;
	readonly baseDirAbs: string;
	readonly baseUri: string;
	readonly browserServeFileAbs: string | undefined;
	readonly browserServeFileName: string | undefined;
	readonly browserServeFileRel: string | undefined;
	readonly browserSrcFileAbs: string | undefined;
	readonly browserSrcFileRel: string | undefined;
	get cacheBuster() {
		return `?cache=${Date.now().toString()}`;
	}
	esbuildOverride: Partial<esbuild.BuildOptions>;
	readonly metaFileRel: string | undefined;
	readonly serveDirAbs: string;
	readonly srcDirAbs: string;
	readonly srcRawDirAbs: string;
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
	 * @param input.srcTmpDirRel Relative path to the directory to which the source code will be copied and pre-processed before being compiled, e.g. for rendering Markdown. Defaults to `./tmp`
	 * @param input.styleServeFileRel Relative path to the root CSS file that will be loaded on all pages. Defaults to `./styles.css`
	 */
	constructor(input: Partial<{
		appSrcFileRel: string;
		assetsSrcDirRel: string | Array<string>;
		baseDirAbs: string;
		baseUri: string;
		browserSrcFileRel: string | undefined;
		esbuild: Partial<esbuild.BuildOptions>;
		metaFileRel: string;
		serveDirRel: string;
		srcRawDirRel: string;
		srcTmpDirRel: string;
		styleServeFileRel: string;
		tsconfigFileRel: string;
	}> = {}) {
		this.esbuildOverride = input.esbuild ?? {};

		this.baseUri = input.baseUri ?? `/`;

		this.baseDirAbs = input.baseDirAbs ?? process.cwd();
		this.serveDirAbs = path.join(this.baseDirAbs, input.serveDirRel ?? `./dist`);
		this.srcRawDirAbs = path.join(this.baseDirAbs, input.srcRawDirRel ?? `./src`);
		this.srcDirAbs = path.join(this.baseDirAbs, input.srcTmpDirRel ?? `./tmp`); // Copying the TS source to `/tmp` is necessary because we want to compile Markdown _before_ we build the JS source. Otherwise we'd be sending Markdown to the browser, and we'd rather send valid HTML and not need to load a Markdown parser
		this.tsconfigFileAbs = path.join(process.cwd(), input.tsconfigFileRel ?? `tsconfig.json`);

		this.assetsSrcDirRel = input.assetsSrcDirRel ?? `./assets`;

		this.metaFileRel = input.metaFileRel;

		this.appSrcFileRel = input.appSrcFileRel ?? `./app.ts`;
		this.appSrcFileAbs = path.join(this.srcDirAbs, this.appSrcFileRel);

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

		fs.rmSync(this.srcDirAbs, { force: true, recursive: true });
		fs.cpSync(this.srcRawDirAbs, this.srcDirAbs, { force: true, recursive: true });

		await this.buildAssets();
		await this.buildTSSource();
		await this.buildScript();
		await this.buildRoutes();
		await this.buildStyles();

		fs.rmSync(this.srcDirAbs, { force: true, recursive: true });

		await this.cleanup();

		if (input.serve === true) {
			this.serve();
		}
	}

	buildAssets(): void | Promise<void> {
		header(`Building assets`);
		const assetsSrcDirRels = typeof this.assetsSrcDirRel === `string`
			?	[this.assetsSrcDirRel]
			:	this.assetsSrcDirRel;
		for (const assetsSrcDirRel of assetsSrcDirRels) {
			const assetsSrcDirAbs = path.join(this.baseDirAbs, assetsSrcDirRel);
			const assetsServeDirAbs = path.join(this.serveDirAbs, assetsSrcDirRel);
			if (fs.existsSync(assetsSrcDirAbs)) {
				log(local(assetsServeDirAbs));
				fs.cpSync(assetsSrcDirAbs, assetsServeDirAbs, { recursive: true });
			}
		}
		logBreak();
	}

	async buildRoutes() {
		header(`Building routes`);

		const { App } = await import(this.appSrcFileAbs) as { App: new() => BaseApp; };
		const app = new App();
		const { resolver, router } = app;

		document.body.replaceWith(app);
		document.documentElement.lang = `en`;

		const builtRoutes = new Set<string>();

		const routes = router.routeNames.map(routeName => async() => {
			const route = router.urls[routeName];

			log(`${routeName.toString()}: ${route.pathname}`);

			if (route.origin !== baseUrl.origin) {
				console.log(`Route is external. Skipping...`);
				logBreak();
				return;
			}

			document.head.innerHTML = ``;

			const url = new URL(route);
			url.hash = ``;
			if (!hasExtension.test(url.pathname)) {
				url.pathname += `index.html`;
			}

			const serveFileRel = url.pathname;
			if (builtRoutes.has(serveFileRel)) {
				console.log(`Route '${routeName}' matches already-built route. Skipping...`);
				logBreak();
				return;
			}

			const page = await resolver.resolve(route);
			resolver.set(page);

			builtRoutes.add(serveFileRel);

			const serveFileAbs = path.join(this.serveDirAbs, serveFileRel);
			const serveDirAbs = path.dirname(serveFileAbs);
			fs.mkdirSync(serveDirAbs, { recursive: true });
			// const pageCompilepath = compilePathsByExportName[page.Ctor.name];

			if (!page.isSSG) {
				console.warn(`Route '${routeName}' is not SSG. Skipping...`);
				logBreak();
				return;
			}

			if (page === undefined) {
				console.warn(`Route '${routeName}' does not resolve to a page. Skipping...`);
				logBreak();
				return;
			}

			let routeCss = ``;
			let routeCssPath = ``;
			for (const style of document.querySelectorAll(`style`)) {
				routeCss += style.textContent?.trim() ?? ``;
				style.textContent = ``;
			}

			if (routeCss.length > 0) {
				routeCss = await this.formatCss(routeCss);
				routeCssPath = `${serveFileRel}.css`;
				const routeCssAbs = path.join(this.serveDirAbs, routeCssPath);
				log(local(routeCssAbs));
				fs.writeFileSync(routeCssAbs, routeCss);
			}

			const pageCompilePath = compilePathsByExportName[page.Ctor.name];
			document.head.innerHTML = this.formatHead(page, {
				pageCompilePath,
				routeCss,
				routeCssPath,
			});

			const html = await this.formatHtml(`<!DOCTYPE html>` + document.documentElement.outerHTML);

			log(local(serveFileAbs));
			fs.writeFileSync(serveFileAbs, html);
			logBreak();
		});

		await promiseConsecutive(routes);
	}

	async buildScript() {
		if (this.browserServeFileAbs === undefined) {
			return;
		}
		header(`Bundling JS`);
		log(local(this.browserServeFileAbs));
		logBreak();

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
			header(`Outputting metafile`);
			log(local(metaFileAbs));
			fs.writeFileSync(metaFileAbs, JSON.stringify(buildResults.metafile));
			logBreak();
		}
		for (const filepath in buildResults.metafile!.outputs) {
			const output = buildResults.metafile!.outputs[filepath];
			for (const exportName of output.exports) {
				compilePathsByExportName[exportName] = filepath;
			}
		}
	}

	async buildStyles() {
		header(`Building root styles`);
		let styles = (await bustCache(this.stylesSrcFileAbs)).default as string; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		styles = await this.formatCss(styles);
		log(local(this.stylesServeFileAbs));
		fs.writeFileSync(this.stylesServeFileAbs, styles);
		logBreak();
	}

	async buildTSSource() {
		header(`Formatting TS source files`);
		const tsSrcsAbs = await glob(`${this.srcDirAbs}/**/*.ts`, { absolute: true });
		for (const tsSrcAbs of tsSrcsAbs) {
			const tsSrc = fs.readFileSync(tsSrcAbs, { encoding: `utf8` });
			const tsSrcModified = await this.formatTSSource(tsSrc);
			if (tsSrc !== tsSrcModified) {
				log(local(tsSrcAbs));
			}
			fs.writeFileSync(tsSrcAbs, tsSrcModified);
		}
		logBreak();
	}

	cleanup(): void | Promise<void> {}

	formatCss(input: string): string | Promise<string> {
		let css = input;
		css = trimNewlines(input);
		css = jsBeautify.css(css, {
			end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
			indent_with_tabs: true,
			space_around_combinator: true,
			space_around_selector_separator: true,
		});
		return css;
	}

	formatHead = (page: Page, meta: Partial<{
		pageCompilePath: string;
		routeCss: string;
		routeCssPath: string;
	}> = {}) => /*html*/`
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

		<title>${document.title}</title>
		<base href="${this.baseUri}">

		${typeof this.browserServeFileRel === `string` ? /*html*/`
			<script src="${path.join(`/`, this.browserServeFileRel)}${this.cacheBuster}" type="module"></script>
		` : ``}

		${typeof this.styleServeFileRel === `string` ? /*html*/`
			<link rel="stylesheet" href="${path.join(`/`, this.styleServeFileRel)}${this.cacheBuster}">
		` : ``}

		${typeof meta.routeCss === `string` && meta.routeCss.length > 0 ? /*html*/`
			<link rel="stylesheet" href="${path.join(`/`, meta.routeCssPath!)}${this.cacheBuster}">
		` : ``}

		<script type="module">import { ${page.Ctor.name} } from '${path.join(`/`, meta.pageCompilePath!)}';</script>

		${Array.from(document.querySelectorAll(`style`)).map(style => style.outerHTML).join(``)}
	`;

	formatHtml(input: string): string | Promise<string> {
		let html = input;
		html = trimNewlines(html);
		html = jsBeautify.html(html, {
			end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
			indent_with_tabs: true,
			unformatted: [`script`],
		});
		return html;
	}

	formatMarkdown(input: string): string | Promise<string> {
		const isMarkdown = [`<markdown>`, `</markdown>`];
		const isJsTemplate = [`\${`, `}`]; // eslint-disable-line quotes
		const jsChunks: Array<string> = [];
		const tokens = stringMates(input, [
			isMarkdown,
			isJsTemplate,
		]);
		return parse(tokens)
			.flat()
			.join(``)
			.replace(/\/%%\//g, () => jsChunks.shift()!);

		function parse(input: Array<string | TagResult>): $.Nested<string> {
			return input.map(item => {
				if (typeof item === `string`) {
					return item;
				}
				const contents = parse(item.contents).flat().join(``);
				if (item.tags === isMarkdown) {
					if (contents.indexOf(`\n`) < 0) {
						return marked.parseInline(contents, { async: false, gfm: true }) as string;
					}
					return marked(contents, { async: false, gfm: true }) as string;
				}
				jsChunks.push(`\${` + contents + `}`); // eslint-disable-line quotes
				return `/%%/`; // TODO3: Use a better placeholder
			});
		}
	}

	formatTSSource(input: string): string | Promise<string> {
		return this.formatMarkdown(input);
	}

	serve(options: (esbuild.ServeOptions) = {}) {
		const port = isNaN(options.port as number) ? 3000 : options.port;
		const retryPort = () => esbuild.context({}).then(context => {
			context.serve({
				port,
				servedir: this.serveDirAbs,
			}).then(() => {
				header(`Serving`);
				log(local(this.serveDirAbs), `http://localhost:${port}`);
				logBreak();
			}).catch(() => {
				void retryPort();
			});
		});

		void retryPort();
	}
}
