import * as $ from '@robertakarobin/jsutil';
import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import fs from 'fs';
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

function log(...args: Array<string>) {
	console.log(args.join(`\n`) + `\n`);
}

export type RoutesModule<Routes extends RouteMap> = {
	resolve: Resolver<Routes>;
	routes: Routes;
};

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
		const assetsSrcDirAbs = path.join(this.baseDirAbs, this.assetsSrcDirRel);
		if (fs.existsSync(assetsSrcDirAbs)) {
			const assetsServeDirAbs = path.join(this.serveDirAbs, this.assetsSrcDirRel);
			log(assetsSrcDirAbs, assetsServeDirAbs);
			fs.cpSync(assetsSrcDirAbs, assetsServeDirAbs, { recursive: true });
		}
	}

	async buildJs() {
		const routesSrcFileAbs = path.join(this.srcDirAbs, this.routesSrcFileRel);
		const { routes, resolve } = (await import(routesSrcFileAbs)) as RoutesModule<Routes>;

		const entryPoints: Array<{ in: string; out: string; }> = [];

		const routeServeFileRelBySrcFileAbs: Record<string, string> = {};

		const routeNames = Object.keys(routes) as Array<keyof Routes>;

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

				let routeServeContents = await resolve(routePath);
				if (routeServeContents) {
					routeServeContents = this.formatHtml(routeServeContents);
					log(`Route: ${routeName as string}`, routePath, routeServeFileAbs);
					fs.mkdirSync(routeServeDirAbs, { recursive: true });
					fs.writeFileSync(routeServeFileAbs, routeServeContents);
				} else {
					log(`${routeName as string} does not resolve to a template.`);
				}

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
				log(routeSrcFileRel, routeServeFileRel);
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

		await esbuild.build({
			absWorkingDir: this.serveDirAbs,
			alias: {
				[this.vendorSrcFileAbs]: this.vendorServeFileName,
			},
			bundle: true,
			entryPoints: [
				{
					in: path.join(this.srcDirAbs, this.scriptSrcFileRel),
					out: `script`,
				},
				...entryPoints,
			],
			external: [this.vendorServeFileName],
			format: `esm`,
			metafile: true,
			outdir: this.serveDirAbs,
			plugins: [pageResolver],
		});
	}

	async buildStyles() {
		const stylesSrcFileAbs = path.join(this.srcDirAbs, `${this.styleServeFileRel}.ts`);
		const stylesServeFileAbs = path.join(this.serveDirAbs, this.styleServeFileRel);
		let styles = (await import(stylesSrcFileAbs)).default as string; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		styles = this.formatCss(styles);
		log(stylesSrcFileAbs, stylesServeFileAbs);
		fs.writeFileSync(stylesServeFileAbs, styles);
	}

	buildVendor() {
		const vendorServeFileAbs = path.join(this.serveDirAbs, this.vendorServeFileName);
		log(this.vendorSrcFileAbs, vendorServeFileAbs);
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
		return defaultLayout(input);
	}

	async serve(options: (esbuild.ServeOptions & { watch?: boolean; }) = {}) {
		const port = options.port || 3000;
		const retryPort = async() => {
			(await esbuild.context({})).serve({
				port,
				servedir: this.serveDirAbs,
			}).then(() => {
				log(this.serveDirAbs, `http://localhost:${port}`);
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
