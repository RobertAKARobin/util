import esbuild from 'esbuild';
import fs from 'fs';
import { glob } from 'glob';
import jsBeautify from 'js-beautify';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';
import path from 'path';

import type * as $ from '@robertakarobin/util/types.d.ts';
import { stringMates, type TagResult } from '@robertakarobin/util/string-mates.ts';
import { baseUrl } from '@robertakarobin/util/context.ts';
import { promiseConsecutive } from '@robertakarobin/util/promiseConsecutive.ts';

import type { ComponentConstructor, PageInstance } from './component.ts';
import { hasExtension, type Resolver, type Router } from './router.ts';

const bustCache = (pathname: string) => {
	const url = new URL(`file:///${pathname}?v=${Date.now() + performance.now()}`); // URL is necessary for running on Windows
	return import(url.toString());
};

const header = (input: string) => console.log(`...${input}...\n`);

const local = (input: string) => path.relative(process.cwd(), input);

const log = (...args: Array<string>) => console.log(args.join(`\n`));

const logBreak = () => console.log(``);

const trimNewlines = (input: string) => input.trim().replace(/[\n\r]+/g, ``);

// Supply various browser/DOM variables for the build environment
let dummyDOM = new JSDOM().window;
const refreshDummyDOM = () => {
	dummyDOM = new JSDOM().window;
	globalThis.customElements = dummyDOM.customElements;
	globalThis.document = dummyDOM.document;
	globalThis.NodeFilter = dummyDOM.NodeFilter;
	globalThis.requestAnimationFrame = () => 0;
};
refreshDummyDOM();

const properties = Object.getOwnPropertyNames(dummyDOM);
for (const propertyName of properties) {
	if (propertyName.startsWith(`HTML`)) {
		const value = dummyDOM[propertyName]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
		Object.assign(globalThis, {
			[propertyName]: value, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
		});
	}
}

const compilePathsByExportName = {} as Record<string, string>;

export class Builder {
	readonly assetsSrcDirRel: string | Array<string>;
	readonly baseDirAbs: string;
	readonly baseUri: string;
	readonly minify: boolean;
	readonly routerSrcFileAbs: string;
	readonly routerSrcFileRel: string;
	readonly scriptServeFileAbs: string | undefined;
	readonly scriptServeFileName: string | undefined;
	readonly scriptServeFileRel: string | undefined;
	readonly scriptSrcFileAbs: string | undefined;
	readonly scriptSrcFileRel: string | undefined;
	readonly serveDirAbs: string;
	readonly srcDirAbs: string;
	readonly srcRawDirAbs: string;
	readonly styleServeFileRel: string;
	readonly stylesServeFileAbs: string;
	readonly stylesSrcFileAbs: string;

	/**
	 *
	 * @param input
	 * @param input.assetsSrcDirRel The relative path/paths to directories that should be copied to the `dist/` folder
	 * @param input.baseDirAbs The root directory for this project. Determines where the Builder looks for other files. Defaults to `process.cwd()`
	 * @param input.baseUri The base URL used when defining routes
	 * @param input.minify Sets ESBuild's `minify` option
	 * @param input.routerSrcFileRel Relative path to the file containing the router, resolver, and renderer. Defaults to `./router.ts`
	 * @param input.scriptSrcFileRel Relative path to the JS script that will be run when a page loads, e.g. the "entry point" for CSR bootstrapping. Not needed for apps that are SSG-only
	 * @param input.serveDirRel Relative path to the directory from which the application will be served. Defaults to `./dist`
	 * @param input.srcRawDirRel Relative path to the source code. Defaults to `./src`
	 * @param input.srcTmpDirRel Relative path to the directory to which the source code will be copied and pre-processed before being compiled, e.g. for rendering Markdown. Defaults to `./tmp`
	 * @param input.styleServeFileRel Relative path to the root CSS file that will be loaded on all pages. Defaults to `./styles.css`
	 */
	constructor(input: Partial<{
		assetsSrcDirRel: string | Array<string>;
		baseDirAbs: string;
		baseUri: string;
		minify: boolean;
		routerSrcFileRel: string;
		scriptSrcFileRel: string | undefined;
		serveDirRel: string;
		srcRawDirRel: string;
		srcTmpDirRel: string;
		styleServeFileRel: string;
	}> = {}) {
		this.baseUri = input.baseUri ?? `/`;

		this.baseDirAbs = input.baseDirAbs ?? process.cwd();
		this.serveDirAbs = path.join(this.baseDirAbs, input.serveDirRel ?? `./dist`);
		this.srcRawDirAbs = path.join(this.baseDirAbs, input.srcRawDirRel ?? `./src`);
		this.srcDirAbs = path.join(this.baseDirAbs, input.srcTmpDirRel ?? `./tmp`); // Copying the TS source to `/tmp` is necessary because we want to compile Markdown _before_ we build the JS source. Otherwise we'd be sending Markdown to the browser, and we'd rather send valid HTML and not need to load a Markdown parser

		this.assetsSrcDirRel = input.assetsSrcDirRel ?? `./assets`;

		this.routerSrcFileRel = input.routerSrcFileRel ?? `./router.ts`;
		this.routerSrcFileAbs = path.join(this.srcDirAbs, this.routerSrcFileRel);

		this.scriptSrcFileRel = `scriptSrcFileRel` in input ? input.scriptSrcFileRel : `./script.ts`;
		if (this.scriptSrcFileRel !== undefined) {
			this.scriptSrcFileAbs = path.join(this.srcDirAbs, this.scriptSrcFileRel);
			this.scriptServeFileName = path.parse(this.scriptSrcFileRel).name;
			this.scriptServeFileAbs = path.join(this.serveDirAbs, this.scriptSrcFileRel);
			this.scriptServeFileRel = path.relative(this.serveDirAbs, `${this.scriptServeFileName}.js`);
		}

		this.styleServeFileRel = input.styleServeFileRel ?? `./styles.css`;
		this.stylesSrcFileAbs = path.join(this.srcDirAbs, `${this.styleServeFileRel}.ts`);
		this.stylesServeFileAbs = path.join(this.serveDirAbs, this.styleServeFileRel);

		this.minify = input.minify ?? true;
	}

	async build(input: { serve?: boolean; } = {}) {
		fs.rmSync(this.serveDirAbs, { force: true, recursive: true });
		fs.mkdirSync(this.serveDirAbs);

		fs.rmSync(this.srcDirAbs, { force: true, recursive: true });
		fs.cpSync(this.srcRawDirAbs, this.srcDirAbs, { force: true, recursive: true });

		await this.buildAssets();
		await this.buildTSSource();
		await this.buildScript();
		await this.buildRoutes();
		await this.buildStyles();

		fs.rmSync(this.srcDirAbs, { force: true, recursive: true });

		await this.cleanup();

		if (input.serve === true) {
			this.serve();
		}
	}

	buildAssets(): void | Promise<void> {
		header(`Building assets`);
		const assetsSrcDirRels = typeof this.assetsSrcDirRel === `string`
			?	[this.assetsSrcDirRel]
			:	this.assetsSrcDirRel;
		for (const assetsSrcDirRel of assetsSrcDirRels) {
			const assetsSrcDirAbs = path.join(this.baseDirAbs, assetsSrcDirRel);
			const assetsServeDirAbs = path.join(this.serveDirAbs, assetsSrcDirRel);
			if (fs.existsSync(assetsSrcDirAbs)) {
				log(local(assetsServeDirAbs));
				fs.cpSync(assetsSrcDirAbs, assetsServeDirAbs, { recursive: true });
			}
		}
		logBreak();
	}

	async buildRoutes() {
		header(`Building routes`);
		const { resolver, router } = (
			await bustCache(this.routerSrcFileAbs)
		) as {
			resolver: Resolver<PageInstance>;
			router: Router<never>;
		};

		const builtRoutes = new Set<string>();

		const cacheBuster = `?cache=${Date.now().toString()}`;

		await promiseConsecutive(
			Object.entries(router.urls).map(([routeName, route]) => async() => {
				log(`${routeName.toString()}: ${route.pathname}`);

				if (route.origin !== baseUrl.origin) {
					console.log(`Route is external. Skipping...`);
					logBreak();
					return;
				}

				const url = new URL(route);
				url.hash = ``;
				if (!hasExtension.test(url.pathname)) {
					url.pathname += `index.html`;
				}

				const serveFileRel = url.pathname;
				if (builtRoutes.has(serveFileRel)) {
					console.log(`Route '${routeName.toString()}' matches already-built route. Skipping...`);
					logBreak();
					return;
				}

				builtRoutes.add(serveFileRel);

				const serveFileAbs = path.join(this.serveDirAbs, serveFileRel);
				const serveDirAbs = path.dirname(serveFileAbs);
				fs.mkdirSync(serveDirAbs, { recursive: true });

				refreshDummyDOM(); // TODO2: On each route the customElements seem to get redefined; need to dump the dummyDOM to prevent errors
				const page = await resolver.resolve(route);
				const pageCompilepath = compilePathsByExportName[page.Ctor.name];

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

				const body = this.formatBody(page.render());

				const head = `
<script type="module">
import { ${page.Ctor.name} } from '${path.join(`/`, pageCompilepath)}';
${page.Ctor.name}.init();
</script>`;

				// let routeCss = ``;
				const routeCssPath = ``;
				// for (const [elName, Subclass] of Component.subclasses) { // document.querySelectorAll($elAttr) doesn't work because static init doesn't get called?
				// 	if (elName === undefined) {
				// 		throw new Error(Subclass.name);
				// 	}
				// 	head += `<style ${Component.$styleAttr}="${elName}"></style>`;
				// 	routeCss += Subclass.style ?? ``;
				// }

				// if (routeCss.length > 0) {
				// 	routeCss = await this.formatCss(routeCss);
				// 	routeCssPath = `${serveFileRel}.css`;
				// 	const routeCssAbs = path.join(this.serveDirAbs, routeCssPath);
				// 	log(local(routeCssAbs));
				// 	fs.writeFileSync(routeCssAbs, routeCss);
				// }

				const html = await this.formatHtml({
					baseUri: this.baseUri,
					body,
					cacheBuster,
					head,
					mainCssPath: path.join(`/`, this.styleServeFileRel),
					mainJsPath: this.scriptServeFileRel === undefined ? undefined : path.join(`/`, this.scriptServeFileRel),
					routeCssPath: typeof routeCssPath === `string` ? path.join(`/`, routeCssPath) : undefined,
					title: page.get(`data-page-title`),
				});

				log(local(serveFileAbs));
				fs.writeFileSync(serveFileAbs, html);
				logBreak();
			})
		);
	}

	async buildScript() {
		if (this.scriptServeFileAbs === undefined) {
			return;
		}
		header(`Bundling JS`);
		log(local(this.scriptServeFileAbs));
		logBreak();
		const buildResults = await esbuild.build({
			absWorkingDir: this.serveDirAbs,
			bundle: true,
			entryPoints: [{
				in: this.scriptSrcFileAbs!,
				out: this.scriptServeFileName!,
			}],
			format: `esm`,
			keepNames: true,
			metafile: true,
			minify: this.minify,
			outdir: this.serveDirAbs,
			splitting: true,
		});
		for (const filepath in buildResults.metafile.outputs) {
			const output = buildResults.metafile.outputs[filepath];
			for (const exportName of output.exports) {
				compilePathsByExportName[exportName] = filepath;
			}
		}
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

	formatBody($root: HTMLElement) {
		return $root.outerHTML;
	}

	formatCss(input: string): string | Promise<string> {
		let css = input;
		css = trimNewlines(input);
		css = jsBeautify.css(css, {
			end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
			indent_with_tabs: true,
			space_around_combinator: true,
			space_around_selector_separator: true,
		});
		return css;
	}

	formatHtml(...[input]: Parameters<typeof defaultLayout>): string | Promise<string> {
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

		function parse(input: Array<string | TagResult>): $.Nested<string> {
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

/**
 * The default layout used to render static HTML files for SSG routes
 */
export const defaultLayout = (input: {
	baseUri: string;
	body?: string;
	cacheBuster: string;
	head?: string;
	loadScript?: string;
	mainCssPath: string;
	mainJsPath: string | undefined;
	meta?: string;
	routeCssPath?: string;
	title: string;
}) => `
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>${input.title}</title>
		<base href="${input.baseUri}">

		${typeof input.meta === `string`
			?	input.meta
			: `<meta name="viewport" content="width=device-width, initial-scale=1">`
		}

		${typeof input.mainJsPath === `string`
			? `<script src="${input.mainJsPath}${input.cacheBuster}" type="module"></script>`
			: ``
		}

		${typeof input.mainCssPath === `string`
			? `<link rel="stylesheet" href="${input.mainCssPath}${input.cacheBuster}">`
			: ``
		}

		${typeof input.head === `string`
			? input.head
			: ``
		}

		${typeof input.routeCssPath === `string`
			? `<link rel="stylesheet" href="${input.routeCssPath}${input.cacheBuster}">`
			: ``
		}

		${typeof input.loadScript === `string`
			? `<script>${input.loadScript}</script>`
			: ``
		}
	</head>

	<body>
		${typeof input.body === `string`
			? input.body
			: ``
		}
	</body>
</html>
`;
