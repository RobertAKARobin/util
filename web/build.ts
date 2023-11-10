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

function log(...args: Array<string>) {
	console.log(args.join(`\n`) + `\n`);
}

export class Builder<Routes extends RouteMap> {
	readonly assetsSrcDirRel: string;
	readonly baseDirAbs: string;
	readonly routesSrcFileRel: string;
	readonly scriptSrcFileRel: string;
	readonly serveDirAbs: string;
	readonly srcDirAbs: string;
	readonly styleServeFileRel: string;
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
		this.routesSrcFileRel = input.routesSrcFileRel || `./routes.ts`;
		this.scriptSrcFileRel = input.scriptSrcFileRel || `./script.ts`;
		this.styleServeFileRel = input.styleServeFileRel || `./styles.css`;
		this.vendorServeFileName = input.vendorServeFileName || `/web.js`;
		this.vendorSrcFileAbs = input.vendorSrcFileAbs || `@robertakarobin/web/index.ts`;
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
		const assetsSrcDirAbs = path.join(this.baseDirAbs, this.assetsSrcDirRel);
		if (fs.existsSync(assetsSrcDirAbs)) {
			const assetsServeDirAbs = path.join(this.serveDirAbs, this.assetsSrcDirRel);
			log(
				path.relative(process.cwd(), assetsSrcDirAbs),
				path.relative(process.cwd(), assetsServeDirAbs),
			);
			fs.cpSync(assetsSrcDirAbs, assetsServeDirAbs, { recursive: true });
		}
	}

	async buildJs() {
		const routesSrcFileAbs = path.join(this.srcDirAbs, this.routesSrcFileRel);
		const { routes, resolve } = (await import(routesSrcFileAbs)) as {
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
						path.relative(process.cwd(), routeServeFileAbs),
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
					path.relative(process.cwd(), routeSrcFileAbs),
					path.join(
						path.relative(process.cwd(), this.serveDirAbs),
						routeServeFileRel,
					),
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
		const scriptSrcFileAbs = path.join(this.srcDirAbs, this.scriptSrcFileRel);
		const scriptServeFileName = path.parse(this.scriptSrcFileRel).name;
		const scriptServeFileRel = path.join(this.serveDirAbs, this.scriptSrcFileRel);
		log(
			path.relative(process.cwd(), scriptSrcFileAbs),
			path.relative(process.cwd(), scriptServeFileRel.replace(/\.ts$/, `.js`))
		);
		const results = await esbuild.build({
			absWorkingDir: this.serveDirAbs,
			alias: {
				[this.vendorSrcFileAbs]: this.vendorServeFileName,
			},
			bundle: true,
			entryPoints: [
				{
					in: scriptSrcFileAbs,
					out: scriptServeFileName,
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
				log(path.relative(process.cwd(), jsServeFileAbs));
				html = this.formatMarkdown(html);
				fs.writeFileSync(jsServeFileAbs, html);
			}
		}
	}

	async buildStyles() {
		header(`Building styles`);
		const stylesSrcFileAbs = path.join(this.srcDirAbs, `${this.styleServeFileRel}.ts`);
		const stylesServeFileAbs = path.join(this.serveDirAbs, this.styleServeFileRel);
		let styles = (await import(stylesSrcFileAbs)).default as string; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		styles = this.formatCss(styles);
		log(
			path.relative(process.cwd(), stylesSrcFileAbs),
			path.relative(process.cwd(), stylesServeFileAbs),
		);
		fs.writeFileSync(stylesServeFileAbs, styles);
	}

	buildVendor() {
		header(`Building vendor JS`);
		const vendorServeFileAbs = path.join(this.serveDirAbs, this.vendorServeFileName);
		log(
			this.vendorSrcFileAbs,
			path.relative(process.cwd(), vendorServeFileAbs)
		);
		return esbuild.build({
			bundle: true,
			entryPoints: [this.vendorSrcFileAbs],
			format: `esm`,
			outfile: vendorServeFileAbs,
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
				log(
					path.relative(process.cwd(), this.serveDirAbs),
					`http://localhost:${port}`,
				);
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
