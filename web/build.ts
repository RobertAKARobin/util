import * as $ from '@robertakarobin/jsutil';
import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { glob } from 'glob';
import { marked } from 'marked';
import path from 'path';

import {
	hasExtension,
	hasHash,
	hasJsTemplate,
	hasMarkdown,
	Page,
	type Resolver,
	type RouteMap,
} from './index.ts';
import defaultLayout from './layout.ts';

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

		await this.buildTSSource();
		this.buildAssets();
		await this.buildStyles();
		this.buildVendor();
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
		log(local(this.scriptServeFileAbs));
		logBreak();
		await esbuild.build({
			absWorkingDir: this.serveDirAbs,
			alias: {
				[this.vendorSrcFileAbs]: this.vendorServeFileName,
			},
			bundle: true,
			entryPoints: [{
				in: this.scriptSrcFileAbs,
				out: this.scriptServeFileName,
			}],
			external: [this.vendorServeFileName],
			format: `esm`,
			metafile: true,
			outdir: this.serveDirAbs,
			splitting: true,
		});
	}

	async buildStyles() {
		header(`Building styles`);
		let styles = (await import(this.stylesSrcFileAbs)).default as string; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
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

	buildVendor() {
		header(`Building vendor JS`);
		log(local(this.vendorServeFileAbs));
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
		return defaultLayout(input);
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
				logBreak();
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
					header(`Watched: ${event}`);
					log(pathName as string);
					logBreak();
					void this.build();
				}
			);
		}
	}
}
