import * as $ from '@robertakarobin/jsutil';
import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { marked } from 'marked';
import path from 'path';

import {
	hasExtension,
	hasHash,
	isRelativePath,
	Page,
	type Resolver,
	type RouteMap,
} from './index.ts';
import defaultLayout from './layout.ts';

const hasMarkdown = /<markdown>(.*?)<\/markdown>/gs;
const hasJsTemplate = /\$\{.*?\}/gs;

const header = (input: string) => console.log(`...${input}...\n`);

const local = (input: string) => path.relative(process.cwd(), input);

const log = (...args: Array<string>) => console.log(args.join(`\n`));

const logBreak = () => console.log(``);

const isStringElse = (input: unknown, fallback: string) =>
	typeof input === `string` ? input : fallback;

export class Builder<Routes extends RouteMap> {
	readonly assetsServeDirAbs: string;
	readonly assetsSrcDirAbs: string;
	readonly assetsSrcDirRel: string;
	readonly baseDirAbs: string;
	readonly routesSrcFileAbs: string;
	readonly routesSrcFileRel: string;
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
	readonly vendorServeFileAbs: string;
	readonly vendorServeFileName: string;
	readonly vendorSrcFileAbs: string;

	constructor(input: Partial<{
		assetsSrcDirRel: string;
		baseDirAbs: string;
		routesSrcFileRel: string;
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

		this.routesSrcFileRel = isStringElse(input.routesSrcFileRel, `./routes.ts`);
		this.routesSrcFileAbs = path.join(this.srcDirAbs, this.routesSrcFileRel);

		this.scriptSrcFileRel = isStringElse(input.scriptSrcFileRel, `./script.ts`);
		this.scriptSrcFileAbs = path.join(this.srcDirAbs, this.scriptSrcFileRel);
		this.scriptServeFileName = path.parse(this.scriptSrcFileRel).name;
		this.scriptServeFileAbs = path.join(this.serveDirAbs, this.scriptSrcFileRel);

		this.styleServeFileRel = isStringElse(input.styleServeFileRel, `./styles.css`);
		this.stylesSrcFileAbs = path.join(this.srcDirAbs, `${this.styleServeFileRel}.ts`);
		this.stylesServeFileAbs = path.join(this.serveDirAbs, this.styleServeFileRel);

		this.vendorSrcFileAbs = isStringElse(input.vendorSrcFileAbs, `@robertakarobin/web/index.ts`);
		this.vendorServeFileName = isStringElse(input.vendorServeFileName, `/web.js`);
		this.vendorServeFileAbs = path.join(this.serveDirAbs, this.vendorServeFileName);
	}

	async build() {
		fs.rmSync(this.serveDirAbs, { force: true, recursive: true });
		fs.mkdirSync(this.serveDirAbs);

		fs.rmSync(this.srcDirAbs, { force: true, recursive: true });
		fs.cpSync(this.srcRawDirAbs, this.srcDirAbs, { force: true, recursive: true });

		this.buildAssets();
		await this.buildStyles();
		this.buildVendor();
		await this.buildJs();

		fs.rmSync(this.srcDirAbs, { force: true, recursive: true });
	}

	buildAssets() {
		header(`Building assets`);
		if (fs.existsSync(this.assetsSrcDirAbs)) {
			log(local(this.assetsSrcDirAbs), local(this.assetsServeDirAbs));
			fs.cpSync(this.assetsSrcDirAbs, this.assetsServeDirAbs, { recursive: true });
		}
		logBreak();
	}

	async buildJs() {
		const { routes, resolve } = (await import(this.routesSrcFileAbs)) as {
			resolve: Resolver<Routes>;
			routes: Routes;
		};

		const routeNames = Object.keys(routes) as Array<keyof Routes>;

		const routeInfos = await $.promiseConsecutive(
			routeNames.map(routeName => async() => {
				const routePath = routes[routeName];
				await resolve(routePath);
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

				const shouldFallback = Page.shouldFallback.last;
				const shouldSplit = Page.shouldSplit.last;

				return {
					routePath,
					serveDirAbs,
					serveFileAbs,
					serveFileRel,
					shouldFallback,
					shouldSplit,
					srcFileAbs,
					srcFileRel,
				};
			})
		);

		header(`Building pages' fallback HTML`);
		await routeInfos.reduce(async(previous, route) => {
			await previous;

			let tsSrc = fs.readFileSync(route.srcFileAbs, { encoding: `utf8` });
			tsSrc = this.formatTSSource(tsSrc);
			fs.writeFileSync(route.srcFileAbs, tsSrc);

			if (route.shouldFallback) {
				log(route.routePath);
				let html = await resolve(route.routePath);
				if (typeof html !== `string`) {
					log(`Does not resolve to a template.`);
					return;
				}
				html = this.formatHtml(html);
				fs.mkdirSync(route.serveDirAbs, { recursive: true });
				log(local(route.serveFileAbs));
				fs.writeFileSync(route.serveFileAbs, html);
				logBreak();
			}
		}, Promise.resolve());

		header(`Bundling JS`);
		const routesBySrcFileAbs = Object.fromEntries(
			routeInfos.map(route => [route.srcFileAbs, route])
		);
		log(local(this.scriptSrcFileAbs), local(this.scriptServeFileAbs));
		logBreak();
		await esbuild.build({
			absWorkingDir: this.serveDirAbs,
			alias: {
				[this.vendorSrcFileAbs]: this.vendorServeFileName,
			},
			bundle: true,
			entryPoints: [
				{
					in: this.scriptSrcFileAbs,
					out: this.scriptServeFileName,
				},
				...routeInfos.filter(route => route.shouldSplit).map(route => ({
					in: route.srcFileAbs,
					out: route.serveFileAbs,
				})),
			],
			external: [this.vendorServeFileName],
			format: `esm`,
			metafile: true,
			outdir: this.serveDirAbs,
			plugins: [{
				name: `Split page resolver`,
				setup: build => {
					header(`Building pages' split JS templates`);
					build.onResolve({ filter: isRelativePath }, args => {
						if (args.kind !== `dynamic-import`) {
							return;
						}

						const srcFileAbs = path.join(this.srcDirAbs, args.path);
						const route = routesBySrcFileAbs[srcFileAbs];
						if (route === undefined) {
							return;
						}

						if (route.shouldSplit) {
							const routeSplitPath = `/${route.serveFileRel}.js`;
							log(route.routePath, `${local(route.serveFileAbs)}.js`);
							logBreak();
							return {
								external: true,
								path: routeSplitPath,
							};
						}
					});
				},
			}],
		});
	}

	async buildStyles() {
		header(`Building styles`);
		let styles = (await import(this.stylesSrcFileAbs)).default as string; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		styles = this.formatCss(styles);
		log(local(this.stylesSrcFileAbs), local(this.stylesServeFileAbs));
		fs.writeFileSync(this.stylesServeFileAbs, styles);
		logBreak();
	}

	buildVendor() {
		header(`Building vendor JS`);
		log(this.vendorSrcFileAbs, local(this.vendorServeFileAbs));
		esbuild.buildSync({
			bundle: true,
			entryPoints: [this.vendorSrcFileAbs],
			format: `esm`,
			outfile: this.vendorServeFileAbs,
		});
		logBreak();
	}

	formatCss(input: string) {
		return input;
	}

	formatHtml(input: string) {
		return this.formatMarkdown(defaultLayout(input));
	}

	formatMarkdown(input: string) {
		let output = input;
		const jsPlaceholder = `/%%/`;
		output = output.replace(hasMarkdown, (nil, markdown: string) => {
			const jsTemplates: Array<string> = [];
			let html = markdown;
			html = html.replace(hasJsTemplate, (js: string) => {
				jsTemplates.push(js);
				return jsPlaceholder;
			});
			html = marked(html.trim());
			html = html.replaceAll(jsPlaceholder, () => {
				const jsTemplate = jsTemplates.shift();
				return typeof jsTemplate === `string` ? jsTemplate : ``;
			});
			return html;
		});
		return output;
	}

	formatTSSource(input: string) {
		return this.formatMarkdown(input);
	}

	async serve(options: (esbuild.ServeOptions & { watch?: boolean; }) = {}) {
		const port = isNaN(options.port as number) ? 3000 : options.port;
		const retryPort = async() => {
			(await esbuild.context({})).serve({
				port,
				servedir: this.serveDirAbs,
			}).then(() => {
				header(`Serving`);
				log(local(this.serveDirAbs), `http://localhost:${port}`);
			}).catch(error => {
				console.warn(error);
				void retryPort();
			});
		};

		await this.build();
		await retryPort();
		if (options.watch === true) {
			fs.watch(
				this.srcRawDirAbs,
				{ recursive: true },
				(event, pathName) => {
					log(`Watched: ${event}`, pathName as string);
					void this.build();
				}
			);
		}
	}
}
