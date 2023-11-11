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

function header(input: string) {
	console.log(`...${input}...\n`);
}

function local(input: string) {
	return path.relative(process.cwd(), input);
}

function log(...args: Array<string>) {
	console.log(args.join(`\n`) + `\n`);
}

export class Builder<Routes extends RouteMap> {
	readonly assetsServeDirAbs: string;
	readonly assetsSrcDirAbs: string;
	readonly assetsSrcDirRel: string;
	readonly baseDirAbs: string;
	readonly routesSrcFileAbs: string;
	readonly routesSrcFileRel: string;
	readonly scriptServeFileName: string;
	readonly scriptServeFileRel: string;
	readonly scriptSrcFileAbs: string;
	readonly scriptSrcFileRel: string;
	readonly serveDirAbs: string;
	readonly srcDirAbs: string;
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
		srcDirRel: string;
		styleServeFileRel: string;
		vendorServeFileName: string;
		vendorSrcFileAbs: string;
	}> = {}) {
		this.baseDirAbs = input.baseDirAbs || process.cwd();
		this.srcDirAbs = path.join(this.baseDirAbs, input.srcDirRel || `./src`);
		this.serveDirAbs = path.join(this.baseDirAbs, input.serveDirRel || `./dist`);

		this.assetsSrcDirRel = input.assetsSrcDirRel || `./assets`;
		this.assetsSrcDirAbs = path.join(this.baseDirAbs, this.assetsSrcDirRel);
		this.assetsServeDirAbs = path.join(this.serveDirAbs, this.assetsSrcDirRel);

		this.routesSrcFileRel = input.routesSrcFileRel || `./routes.ts`;
		this.routesSrcFileAbs = path.join(this.srcDirAbs, this.routesSrcFileRel);

		this.scriptSrcFileRel = input.scriptSrcFileRel || `./script.ts`;
		this.scriptSrcFileAbs = path.join(this.srcDirAbs, this.scriptSrcFileRel);
		this.scriptServeFileName = path.parse(this.scriptSrcFileRel).name;
		this.scriptServeFileRel = path.join(this.serveDirAbs, this.scriptSrcFileRel);

		this.styleServeFileRel = input.styleServeFileRel || `./styles.css`;
		this.stylesSrcFileAbs = path.join(this.srcDirAbs, `${this.styleServeFileRel}.ts`);
		this.stylesServeFileAbs = path.join(this.serveDirAbs, this.styleServeFileRel);

		this.vendorSrcFileAbs = input.vendorSrcFileAbs || `@robertakarobin/web/index.ts`;
		this.vendorServeFileName = input.vendorServeFileName || `/web.js`;
		this.vendorServeFileAbs = path.join(this.serveDirAbs, this.vendorServeFileName);
	}

	async build() {
		fs.rmSync(this.serveDirAbs, { force: true, recursive: true });
		fs.mkdirSync(this.serveDirAbs);

		this.buildAssets();
		await this.buildStyles();
		await this.buildVendor();
		await this.buildJs();
	}

	buildAssets() {
		header(`Building assets`);
		if (fs.existsSync(this.assetsSrcDirAbs)) {
			log(local(this.assetsSrcDirAbs), local(this.assetsServeDirAbs));
			fs.cpSync(this.assetsSrcDirAbs, this.assetsServeDirAbs, { recursive: true });
		}
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

				const tmpFileAbs = `${srcFileAbs}.tmp.ts`;

				return {
					routePath,
					serveDirAbs,
					serveFileAbs,
					serveFileRel,
					shouldFallback,
					shouldSplit,
					srcFileAbs,
					srcFileRel,
					tmpFileAbs,
				};
			})
		);

		await routeInfos.reduce(async(previous, route) => {
			await previous;

			let source = fs.readFileSync(route.srcFileAbs, { encoding: `utf8` });
			source = this.formatMarkdown(source);
			fs.renameSync(route.srcFileAbs, route.tmpFileAbs);
			fs.writeFileSync(route.srcFileAbs, source);

			if (route.shouldFallback) {
				let html = await resolve(route.routePath);
				if (!html) {
					log(`Does not resolve to a template.`);
					return;
				}
				html = this.formatHtml(html);
				fs.mkdirSync(route.serveDirAbs, { recursive: true });
				fs.writeFileSync(route.serveFileAbs, html);
			}
		}, Promise.resolve());

		const routesBySrcFileRel = Object.fromEntries(
			routeInfos.map(route => [`./${route.srcFileRel}`, route])
		);
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
				setup(build) {
					build.onResolve({ filter: isRelativePath }, args => {
						if (args.kind !== `dynamic-import`) {
							return;
						}

						const route = routesBySrcFileRel[args.path];
						if (!route) {
							return;
						}

						if (route.shouldSplit) {
							return {
								external: true,
								path: `/${route.serveFileRel}.js`,
							};
						}
					});
				},
			}],
		});

		await routeInfos.reduce(async(previous, route) => {
			await previous;
			fs.renameSync(route.tmpFileAbs, route.srcFileAbs);
		}, Promise.resolve());
	}

	async buildStyles() {
		header(`Building styles`);

		let styles = (await import(this.stylesSrcFileAbs)).default as string; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		styles = this.formatCss(styles);
		log(local(this.stylesSrcFileAbs), local(this.stylesServeFileAbs));
		fs.writeFileSync(this.stylesServeFileAbs, styles);
	}

	buildVendor() {
		header(`Building vendor JS`);
		log(this.vendorSrcFileAbs, local(this.vendorServeFileAbs));
		return esbuild.build({
			bundle: true,
			entryPoints: [this.vendorSrcFileAbs],
			format: `esm`,
			outfile: this.vendorServeFileAbs,
		});
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
			html = html.replaceAll(jsPlaceholder, () => jsTemplates.shift() || ``);
			return html;
		});
		return output;
	}

	async serve(options: (esbuild.ServeOptions & { watch?: boolean; }) = {}) {
		const port = options.port || 3000;
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
		if (options.watch) {
			fs.watch(
				this.srcDirAbs,
				{ recursive: true },
				(event, pathName) => {
					log(`Watched: ${event}`, pathName as string);
					void this.build();
				}
			);
		}
	}
}
