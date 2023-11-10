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

		const entryPoints: Array<{ in: string; out: string; }> = [];

		const routeServeFileRelBySrcFileAbs: Record<string, string> = {};

		const routeNames = Object.keys(routes) as Array<keyof Routes>;

		header(`Building fallback page templates`);
		await $.promiseConsecutive(
			routeNames.map(routeName => async() => {
				const routePath = routes[routeName];

				let routeServeFileRel = routePath as string;
				if (!routeServeFileRel.startsWith(`/`)) {
					routeServeFileRel = `/${routeServeFileRel}`;
				}
				routeServeFileRel = routeServeFileRel.replace(hasHash, ``);
				if (!hasExtension.test(routeServeFileRel)) {
					routeServeFileRel = path.join(routeServeFileRel, `index.html`);
				}

				const routeServeDirRel = path.dirname(routeServeFileRel);
				const routeServeDirAbs = path.join(this.serveDirAbs, routeServeDirRel);
				const routeServeFileAbs = path.join(
					routeServeDirAbs,
					path.basename(routeServeFileRel),
				);

				// Create fallback HTML template
				let routeServeContents = await resolve(routePath);
				if (routeServeContents) {
					routeServeContents = this.formatHtml(routeServeContents);
					log(
						`Route: ${routeName as string}`,
						routePath,
						local(routeServeFileAbs),
					);
					fs.mkdirSync(routeServeDirAbs, { recursive: true });
					fs.writeFileSync(routeServeFileAbs, routeServeContents);
				} else {
					log(`${routeName as string} does not resolve to a template.`);
				}

				// Create split/dynamically-loaded JS template
				let routeSrcFileAbs = Page.importMetaUrl.last;
				if (routeSrcFileAbs) {
					routeSrcFileAbs = fileURLToPath(routeSrcFileAbs);
					entryPoints.push({
						in: routeSrcFileAbs,
						out: routeServeFileAbs,
					});
					routeServeFileRelBySrcFileAbs[routeSrcFileAbs] = routeServeFileRel;
				}
			})
		);

		const buildDynamicPage = (args: esbuild.OnResolveArgs) => {
			if (args.kind !== `dynamic-import`) {
				return null;
			}
			const routeSrcFileRel = args.path;
			const routeSrcFileAbs = path.join(this.srcDirAbs, routeSrcFileRel);
			let routeServeFileRel = routeServeFileRelBySrcFileAbs[routeSrcFileAbs];
			if (routeServeFileRel) {
				routeServeFileRel = routeServeFileRel.startsWith(`/`)
					? `${routeServeFileRel}.js`
					: `/${routeServeFileRel}.js`;
				log(
					local(routeSrcFileAbs),
					path.join(local(this.serveDirAbs), routeServeFileRel),
				);
				return {
					external: true,
					path: routeServeFileRel,
				};
			}
		};

		const pageResolver: esbuild.Plugin = {
			name: `Page dynamic import resolver`,
			setup(build) {
				build.onResolve({ filter: isRelativePath }, buildDynamicPage.bind(this));
			},
		};

		header(`Bundling JS and building dynamically-imported page templates`);
		log(
			local(this.scriptSrcFileAbs),
			local(this.scriptServeFileRel.replace(/\.ts$/, `.js`)),
		);
		const results = await esbuild.build({
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
				...entryPoints,
			],
			external: [this.vendorServeFileName],
			format: `esm`,
			metafile: true,
			outdir: this.serveDirAbs,
			plugins: [pageResolver],
		});

		header(`Converting Markdown to HTML`);
		for (const jsServeFileRel in results.metafile.outputs) {
			const jsServeFileAbs = path.join(this.serveDirAbs, jsServeFileRel);
			let html = fs.readFileSync(jsServeFileAbs, { encoding: `utf8` });
			if (hasMarkdown.test(html)) {
				log(local(jsServeFileAbs));
				html = this.formatMarkdown(html);
				fs.writeFileSync(jsServeFileAbs, html);
			}
		}
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
		} else {
			void this.build();
		}
	}
}
