import * as $ from '@robertakarobin/jsutil';
import { stringMates, type TagResult } from '@robertakarobin/jsutil/string-mates.ts';
import esbuild from 'esbuild';
import fs from 'fs';
import { glob } from 'glob';
import { marked } from 'marked';
import path from 'path';

import {
	type Component,
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
	subclasses: Set<typeof Component>;
};

const bustCache = (path: string) => import(`${path}?v=${Date.now() + performance.now()}`);

const header = (input: string) => console.log(`...${input}...\n`);

const local = (input: string) => path.relative(process.cwd(), input);

const log = (...args: Array<string>) => console.log(args.join(`\n`));

const logBreak = () => console.log(``);

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
				const routePath = router.routes[routeName];
				log(`${routeName.toString()}: ${routePath.pathname}`);

				const page = await router.resolve(routePath);
				if (page === undefined) {
					console.warn(`Route '${routeName.toString()}' does not resolve to a page. Skipping...`);
					logBreak();
					return;
				}

				const body = page.template(); // Populates subclasses used on page
				if (page === undefined || !page.isSSG) {
					logBreak();
					return;
				}

				const subclasses = new Set<typeof Component>();
				const getSubclasses = (parent: Component) => {
					subclasses.add(parent.constructor as typeof Component);
					for (const child of parent.children) {
						getSubclasses(child);
					}
				};
				getSubclasses(page);

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
				let css = Array.from(subclasses.values())
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
					subclasses,
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
						return marked.parseInline(contents, { gfm: true }) as string;
					}
					return marked(contents, { gfm: true });
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
