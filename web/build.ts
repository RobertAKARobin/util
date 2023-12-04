import * as $ from '@robertakarobin/jsutil/index.ts';
import { type Resolver, type Router } from '@robertakarobin/jsutil/router.ts';
import { stringMates, type TagResult } from '@robertakarobin/jsutil/string-mates.ts';
import esbuild from 'esbuild';
import fs from 'fs';
import { glob } from 'glob';
import jsBeautify from 'js-beautify';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';
import path from 'path';
import { serialize } from '@robertakarobin/jsutil/serialize.ts';

import { Component, globals } from './component.ts';
import { defaultLayout } from './layout.ts';
import { type Page } from './page.ts';

export type LayoutArgs = {
	baseHref: string;
	body?: string;
	css?: string;
	head?: string;
	loadScript?: string;
	mainCssPath: string;
	mainJsPath: string;
	meta?: string;
	page: Page;
	routeCssPath?: string;
	routePath: string;
};

const bustCache = (pathname: string) => {
	const url = new URL(`file:///${pathname}?v=${Date.now() + performance.now()}`); // URL is necessary for running on Windows
	return import(url.toString());
};

export const hasExtension = /\.\w+$/;
export const hasHash = /#.*$/;

const header = (input: string) => console.log(`...${input}...\n`);

const local = (input: string) => path.relative(process.cwd(), input);

const log = (...args: Array<string>) => console.log(args.join(`\n`));

const logBreak = () => console.log(``);

const trimNewlines = (input: string) => input.trim().replace(/[\n\r]+/g, ``);


Component.parse = function(input: string) {
	const dom = new JSDOM(input);
	Component.NodeFilter = dom.window.NodeFilter;
	return dom.window.document;
};

export class Builder {
	readonly assetsServeDirAbs: string;
	readonly assetsSrcDirAbs: string;
	readonly assetsSrcDirRel: string;
	readonly baseDirAbs: string;
	readonly baseHref: string;
	readonly routerSrcFileAbs: string;
	readonly routerSrcFileRel: string;
	readonly scriptServeFileAbs: string;
	readonly scriptServeFileName: string;
	readonly scriptServeFileRel: string;
	readonly scriptSrcFileAbs: string;
	readonly scriptSrcFileRel: string;
	readonly serveDirAbs: string;
	readonly srcDirAbs: string;
	readonly srcRawDirAbs: string;
	readonly styleServeFileRel: string;
	readonly stylesServeFileAbs: string;
	readonly stylesSrcFileAbs: string;

	constructor(input: Partial<{
		assetsSrcDirRel: string;
		baseDirAbs: string;
		baseHref: string;
		routerSrcFileRel: string;
		scriptSrcFileRel: string;
		serveDirRel: string;
		srcRawDirRel: string;
		srcTmpDirRel: string;
		styleServeFileRel: string;
		vendorServeFileName: string;
		vendorSrcFileAbs: string;
	}> = {}) {
		this.baseHref = input.baseHref ?? `/`;

		this.baseDirAbs = input.baseDirAbs ?? process.cwd();
		this.serveDirAbs = path.join(this.baseDirAbs, input.serveDirRel ?? `./dist`);
		this.srcRawDirAbs = path.join(this.baseDirAbs, input.srcRawDirRel ?? `./src`);
		this.srcDirAbs = path.join(this.baseDirAbs, input.srcTmpDirRel ?? `./tmp`);

		this.assetsSrcDirRel = input.assetsSrcDirRel ?? `./assets`;
		this.assetsSrcDirAbs = path.join(this.baseDirAbs, this.assetsSrcDirRel);
		this.assetsServeDirAbs = path.join(this.serveDirAbs, this.assetsSrcDirRel);

		this.routerSrcFileRel = input.routerSrcFileRel ?? `./router.ts`;
		this.routerSrcFileAbs = path.join(this.srcDirAbs, this.routerSrcFileRel);

		this.scriptSrcFileRel = input.scriptSrcFileRel ?? `./script.ts`;
		this.scriptSrcFileAbs = path.join(this.srcDirAbs, this.scriptSrcFileRel);
		this.scriptServeFileName = path.parse(this.scriptSrcFileRel).name;
		this.scriptServeFileAbs = path.join(this.serveDirAbs, this.scriptSrcFileRel);
		this.scriptServeFileRel = path.relative(this.serveDirAbs, `${this.scriptServeFileName}.js`);

		this.styleServeFileRel = input.styleServeFileRel ?? `./styles.css`;
		this.stylesSrcFileAbs = path.join(this.srcDirAbs, `${this.styleServeFileRel}.ts`);
		this.stylesServeFileAbs = path.join(this.serveDirAbs, this.styleServeFileRel);
	}

	async build(input: { serve?: boolean; } = {}) {
		fs.rmSync(this.serveDirAbs, { force: true, recursive: true });
		fs.mkdirSync(this.serveDirAbs);

		fs.rmSync(this.srcDirAbs, { force: true, recursive: true });
		fs.cpSync(this.srcRawDirAbs, this.srcDirAbs, { force: true, recursive: true });

		await this.buildTSSource();
		this.buildAssets();
		await this.buildStyles();
		await this.buildRoutes();

		fs.rmSync(this.srcDirAbs, { force: true, recursive: true });

		await this.cleanup();

		if (input.serve === true) {
			this.serve();
		}
	}

	buildAssets() {
		header(`Building assets`);
		if (fs.existsSync(this.assetsSrcDirAbs)) {
			log(local(this.assetsServeDirAbs));
			fs.cpSync(this.assetsSrcDirAbs, this.assetsServeDirAbs, { recursive: true });
		}
		logBreak();
	}

	async buildRoutes() {
		header(`Building routes`);
		const { resolver, router } = (
			await bustCache(this.routerSrcFileAbs)
		) as {
			resolver: Resolver<Page>;
			router: Router<never>;
		};

		const builtRoutes = new Set<string>();

		await $.promiseConsecutive(
			Object.entries(router.routes).map(([routeName, route]) => async() => {
				log(`${routeName.toString()}: ${route.pathname}`);

				let serveFileRel = route.pathname;
				serveFileRel = serveFileRel
					.replace(/^\//, ``)
					.replace(hasHash, ``);
				if (!hasExtension.test(serveFileRel)) {
					serveFileRel = path.join(serveFileRel, `index.html`);
				}

				if (builtRoutes.has(serveFileRel)) {
					console.log(`Route '${routeName.toString()}' matches already-built route. Skipping...`);
					logBreak();
					return;
				}

				builtRoutes.add(serveFileRel);

				const serveFileAbs = path.join(this.serveDirAbs, serveFileRel);
				const serveDirAbs = path.dirname(serveFileAbs);
				fs.mkdirSync(serveDirAbs, { recursive: true });

				Component.subclasses.clear();
				Component.instances.clear();
				Component.currentParent = new Component({ id: `` });

				const page = await resolver.resolve(route);
				if (!page.isSSG) {
					console.warn(`Route '${routeName.toString()}' is not SSG. Skipping...`);
					logBreak();
					return;
				}

				if (page === undefined) {
					console.warn(`Route '${routeName.toString()}' does not resolve to a page. Skipping...`);
					logBreak();
					return;
				}

				let body = page.render();

				const componentArgs = globals[Component.unhydratedDataName];
				body += `<script id="${Component.unhydratedDataName}" src="data:text/javascript," onload="${Component.unhydratedDataName}=${serialize(componentArgs)}"></script>`;
				globals[Component.unhydratedDataName] = {};

				let routeCssPath: string | undefined = undefined;
				let css = Array.from(Component.subclasses.values())
					.map(Subclass => Subclass.style)
					.filter(Boolean).join(`\n`);

				if (css.length > 0) {
					css = await this.formatCss(css);
					routeCssPath = `${serveFileRel}.css`;
					const routeCssAbs = path.join(this.serveDirAbs, routeCssPath);
					log(local(routeCssAbs));
					fs.writeFileSync(routeCssAbs, css);
				}

				const html = await this.formatHtml({
					baseHref: this.baseHref,
					body,
					css,
					mainCssPath: path.join(`/`, this.styleServeFileRel),
					mainJsPath: path.join(`/`, this.scriptServeFileRel),
					page,
					routeCssPath: typeof routeCssPath === `string` ? path.join(`/`, routeCssPath) : undefined,
					routePath: path.join(`/`, route.pathname),
				});
				log(local(serveFileAbs));
				fs.writeFileSync(serveFileAbs, html);
				logBreak();
			})
		);

		header(`Bundling JS`);
		log(local(this.scriptServeFileAbs));
		logBreak();
		await esbuild.build({
			absWorkingDir: this.serveDirAbs,
			bundle: true,
			entryPoints: [{
				in: this.scriptSrcFileAbs,
				out: this.scriptServeFileName,
			}],
			format: `esm`,
			keepNames: true,
			metafile: true,
			minify: false,
			outdir: this.serveDirAbs,
			splitting: true,
		});
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
		});
		return css;
	}

	formatHtml(input: LayoutArgs): string | Promise<string> {
		let html = defaultLayout(input);
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

		function parse(input: Array<string | TagResult>): $.Type.Nested<string> {
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
