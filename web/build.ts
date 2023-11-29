import * as $ from '@robertakarobin/jsutil';
import { stringMates, type TagResult } from '@robertakarobin/jsutil/string-mates.ts';
import esbuild from 'esbuild';
import fs from 'fs';
import { glob } from 'glob';
import { marked } from 'marked';
import path from 'path';

import {
	Component,
	hasExtension,
	hasHash,
	type Page,
	type RouteMap,
	type Router,
} from './index.ts';
import { defaultLayout } from './layout.ts';

export type LayoutArgs = {
	body?: string;
	css?: string;
	head?: string;
	mainCssPath: string;
	mainJsPath: string;
	meta?: string;
	page: Page;
	routeCssPath?: string;
	routePath: string;
};

const bustCache = (path: string) => import(`${path}?v=${Date.now() + performance.now()}`);

const header = (input: string) => console.log(`...${input}...\n`);

const local = (input: string) => path.relative(process.cwd(), input);

const log = (...args: Array<string>) => console.log(args.join(`\n`));

const logBreak = () => console.log(``);

/**
 * Serialize an object as a native JS value so that it can be included in `on*` attributes. TODO2: Use JSON5 or something robust
 */
function serialize(input: any): string { // eslint-disable-line @typescript-eslint/no-explicit-any
	if (input === null || input === undefined) {
		return ``;
	}
	if (Array.isArray(input)) {
		return `[${input.map(serialize).join(`,`)}]`;
	}
	if (typeof input === `object`) {
		let out = ``;
		for (const property in input) {
			const value = input[property] as Record<string, unknown>; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
			out += `${property.replaceAll(`"`, `&quot;`)}:${serialize(value)},`;
		}
		return `{${out}}`;
	}
	if (typeof input === `string`) {
		const out = input
			.replaceAll(`"`, `&quot;`)
			.replaceAll(`'`, `\\'`);
		return `'${out}'`;
	}
	return input.toString(); // eslint-disable-line
};

Component.prototype.render = function(content = ``) {
	const key = Component.name;
	const argsString = serialize(this.args);
	const template = this.template().trim();
	const hasOneRootElement = /^<(\w+).*<\/\1>$/s.test(template); // TODO2: False positive for e.g. <div>one</div> <div>two</div>
	const isOneElement = /^<[^<>]+>$/s.test(template);
	if (!hasOneRootElement && !isOneElement) {
		throw new Error(`Template for ${this.Ctor.name} invalid: Component templates must have one root HTML element`);
	}
	let out = ``;
	if (this.isCSR) {
		out += `<script src="data:text/javascript," onload="window.${key}=window.${key}||[];window.${key}.push([this,'${this.Ctor.name}',${argsString}])"></script>`; // Need an element that is valid HTML anywhere, will trigger an action when it is rendered, and can provide a reference to itself, its constructor type, and the instance's constructor args. TODO2: A less-bad way of passing arguments. Did it this way because it's the least-ugly way of serializing objects, but does output double-quotes so can't put it in the `onload` function without a lot of replacing
	}
	if (this.isSSG) {
		out += this.template(content);
	}
	return out;
};

export class Builder {
	readonly assetsServeDirAbs: string;
	readonly assetsSrcDirAbs: string;
	readonly assetsSrcDirRel: string;
	readonly baseDirAbs: string;
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
		routerSrcFileRel: string;
		scriptSrcFileRel: string;
		serveDirRel: string;
		srcRawDirRel: string;
		srcTmpDirRel: string;
		styleServeFileRel: string;
		vendorServeFileName: string;
		vendorSrcFileAbs: string;
	}> = {}) {
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
		const { router } = (
			await bustCache(this.routerSrcFileAbs)
		) as { router: Router<RouteMap>; };

		const routeNames = Object.keys(router.routes);

		await $.promiseConsecutive(
			routeNames.map(routeName => async() => {
				Component.subclasses.clear();

				const routePath = router.routes[routeName];
				log(`${routeName.toString()}: ${routePath.pathname}`);

				const page = await router.resolve(routePath);
				if (page === undefined) {
					console.warn(`Route '${routeName.toString()}' does not resolve to a page. Skipping...`);
					logBreak();
					return;
				}

				const body = page.render(``); // Populates subclasses used on page
				if (page === undefined || !page.isSSG) {
					logBreak();
					return;
				}

				let serveFileRel = routePath.pathname;
				serveFileRel = serveFileRel
					.replace(/^\//, ``)
					.replace(hasHash, ``);
				if (!hasExtension.test(serveFileRel)) {
					serveFileRel = path.join(serveFileRel, `index.html`);
				}
				const serveFileAbs = path.join(this.serveDirAbs, serveFileRel);
				const serveDirAbs = path.dirname(serveFileAbs);
				fs.mkdirSync(serveDirAbs, { recursive: true });

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
					body,
					css,
					mainCssPath: path.join(`/`, this.styleServeFileRel),
					mainJsPath: path.join(`/`, this.scriptServeFileRel),
					page,
					routeCssPath: typeof routeCssPath === `string` ? path.join(`/`, routeCssPath) : undefined,
					routePath: path.join(`/`, routePath.pathname),
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
			minify: true,
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
		return input;
	}

	formatHtml(input: LayoutArgs): string | Promise<string> {
		return defaultLayout(input);
	}

	formatMarkdown(input: string): string | Promise<string> {
		const isMarkdown = [`<markdown>`, `</markdown>`];
		const isJsTemplate = ['${', '}']; // eslint-disable-line quotes
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
				jsChunks.push('${' + contents + '}'); // eslint-disable-line quotes
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
