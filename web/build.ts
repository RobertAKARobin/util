import * as $ from '@robertakarobin/jsutil';
import { stringMates, type TagResult } from '@robertakarobin/jsutil/string-mates.ts';
import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { glob } from 'glob';
import { marked } from 'marked';
import path from 'path';

import {
	type App,
	hasExtension,
	hasHash,
	Page,
	type RouteMap,
} from './index.ts';
import defaultLayout from './layout.ts';

const bustCache = (path: string) => import(`${path}?v=${Date.now() + performance.now()}`);

const header = (input: string) => console.log(`...${input}...\n`);

const local = (input: string) => path.relative(process.cwd(), input);

const log = (...args: Array<string>) => console.log(args.join(`\n`));

const logBreak = () => console.log(``);

const isStringElse = (input: unknown, fallback: string) =>
	typeof input === `string` ? input : fallback;

export class Builder<
	Routes extends RouteMap
> {
	readonly appSrcFileAbs: string;
	readonly appSrcFileRel: string;
	readonly assetsServeDirAbs: string;
	readonly assetsSrcDirAbs: string;
	readonly assetsSrcDirRel: string;
	readonly baseDirAbs: string;
	readonly scriptServeFileAbs: string;
	readonly scriptServeFileName: string;
	readonly scriptSrcFileAbs: string;
	readonly scriptSrcFileRel: string;
	readonly serveDirAbs: string;
	readonly srcDirAbs: string;
	readonly srcRawDirAbs: string;
	readonly styleServeFileRel: string;
	readonly stylesServeFileAbs: string;
	readonly stylesSrcFileAbs: string;

	constructor(input: Partial<{
		appSrcFileRel: string;
		assetsSrcDirRel: string;
		baseDirAbs: string;
		scriptSrcFileRel: string;
		serveDirRel: string;
		srcRawDirRel: string;
		srcTmpDirRel: string;
		styleServeFileRel: string;
		vendorServeFileName: string;
		vendorSrcFileAbs: string;
	}> = {}) {
		this.baseDirAbs = isStringElse(input.baseDirAbs, process.cwd());
		this.serveDirAbs = path.join(this.baseDirAbs, isStringElse(input.serveDirRel, `./dist`));
		this.srcRawDirAbs = path.join(this.baseDirAbs, isStringElse(input.srcRawDirRel, `./src`));
		this.srcDirAbs = path.join(this.baseDirAbs, isStringElse(input.srcTmpDirRel, `./tmp`));

		this.assetsSrcDirRel = isStringElse(input.assetsSrcDirRel, `./assets`);
		this.assetsSrcDirAbs = path.join(this.baseDirAbs, this.assetsSrcDirRel);
		this.assetsServeDirAbs = path.join(this.serveDirAbs, this.assetsSrcDirRel);

		this.appSrcFileRel = isStringElse(input.appSrcFileRel, `./app.ts`);
		this.appSrcFileAbs = path.join(this.srcDirAbs, this.appSrcFileRel);

		this.scriptSrcFileRel = isStringElse(input.scriptSrcFileRel, `./script.ts`);
		this.scriptSrcFileAbs = path.join(this.srcDirAbs, this.scriptSrcFileRel);
		this.scriptServeFileName = path.parse(this.scriptSrcFileRel).name;
		this.scriptServeFileAbs = path.join(this.serveDirAbs, this.scriptSrcFileRel);

		this.styleServeFileRel = isStringElse(input.styleServeFileRel, `./styles.css`);
		this.stylesSrcFileAbs = path.join(this.srcDirAbs, `${this.styleServeFileRel}.ts`);
		this.stylesServeFileAbs = path.join(this.serveDirAbs, this.styleServeFileRel);
	}

	async build(input: { serve?: boolean; } = {}) {
		if (input.serve === true) {
			this.serve();
		}

		fs.rmSync(this.serveDirAbs, { force: true, recursive: true });
		fs.mkdirSync(this.serveDirAbs);

		fs.rmSync(this.srcDirAbs, { force: true, recursive: true });
		fs.cpSync(this.srcRawDirAbs, this.srcDirAbs, { force: true, recursive: true });

		await this.buildTSSource();
		this.buildAssets();
		await this.buildStyles();
		await this.buildJs();

		fs.rmSync(this.srcDirAbs, { force: true, recursive: true });
	}

	buildAssets() {
		header(`Building assets`);
		if (fs.existsSync(this.assetsSrcDirAbs)) {
			log(local(this.assetsServeDirAbs));
			fs.cpSync(this.assetsSrcDirAbs, this.assetsServeDirAbs, { recursive: true });
		}
		logBreak();
	}

	async buildJs() {
		const { app } = (await bustCache(this.appSrcFileAbs)) as { app: App<Routes>; };

		const routeNames = Object.keys(app.routes) as Array<keyof Routes>;

		const routeInfos = await $.promiseConsecutive(
			routeNames.map(routeName => async() => {
				const routePath = app.routes[routeName];
				await app.resolve(routePath); // Populates `Page.importMetaUrl`, `Page.title`, and `Component.style` emitters
				const srcFileAbs = fileURLToPath(Page.importMetaUrl.last);
				const srcFileRel = path.relative(this.srcDirAbs, srcFileAbs);

				let serveFileRel = routePath as string;
				serveFileRel = serveFileRel
					.replace(/^\//, ``)
					.replace(hasHash, ``);
				if (!hasExtension.test(serveFileRel)) {
					serveFileRel = path.join(serveFileRel, `index.html`);
				}
				const serveFileAbs = path.join(this.serveDirAbs, serveFileRel);
				const serveDirAbs = path.dirname(serveFileAbs);

				const isSSG = Page.isSSG.last;

				return {
					isSSG,
					routePath,
					serveDirAbs,
					serveFileAbs,
					serveFileRel,
					srcFileAbs,
					srcFileRel,
				};
			})
		);

		header(`Building SSG pages`);
		await routeInfos.reduce(async(previous, route) => {
			await previous;

			if (route.isSSG) {
				log(route.routePath);
				let html = await app.resolve(route.routePath);
				html = this.formatHtml(html);
				fs.mkdirSync(route.serveDirAbs, { recursive: true });
				log(local(route.serveFileAbs));
				fs.writeFileSync(route.serveFileAbs, html);
				logBreak();
			}
		}, Promise.resolve());

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
			metafile: true,
			minify: true,
			outdir: this.serveDirAbs,
			splitting: true,
		});
	}

	async buildStyles() {
		header(`Building styles`);
		let styles = (await bustCache(this.stylesSrcFileAbs)).default as string; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		styles = this.formatCss(styles);
		log(local(this.stylesServeFileAbs));
		fs.writeFileSync(this.stylesServeFileAbs, styles);
		logBreak();
	}

	async buildTSSource() {
		header(`Formatting TS source files`);
		const tsSrcsAbs = await glob(`${this.srcDirAbs}/**/*.ts`, { absolute: true });
		for (const tsSrcAbs of tsSrcsAbs) {
			const tsSrc = fs.readFileSync(tsSrcAbs, { encoding: `utf8` });
			const tsSrcModified = this.formatTSSource(tsSrc);
			if (tsSrc !== tsSrcModified) {
				log(local(tsSrcAbs));
			}
			fs.writeFileSync(tsSrcAbs, tsSrcModified);
		}
		logBreak();
	}

	formatCss(input: string) {
		return input;
	}

	formatHtml(input: string) {
		return defaultLayout(input);
	}

	formatMarkdown(input: string) {
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

	formatTSSource(input: string) {
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
