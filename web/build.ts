import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { promiseConsecutive } from '@robertakarobin/jsutil';

import { matchExtension, Page, type Resolver, type RouteMap } from './index.ts';
import defaultLayout from './layout.ts';

const buildOptionsDefaults = <Routes extends RouteMap>() => ({
	assetsdir: `./assets`,
	basedir: process.cwd(),
	formatCss: (input: string) => input,
	formatHtml: (input: string) => input,
	layout: defaultLayout,
	port: 3000,
	resolve: null as unknown as Resolver<Routes>,
	routes: {} as Routes,
	servedir: `./dist`,
	srcdir: `./src`,
});

export type BuildOptions<Routes extends RouteMap> =
	& Partial<
		ReturnType<typeof buildOptionsDefaults<Routes>>
	>
	& Pick<
		ReturnType<typeof buildOptionsDefaults<Routes>>,
		| `routes`
		| `resolve`
	>;

export async function getBuildOptions<Routes extends RouteMap>(
	options: BuildOptions<Routes>
) {
	const {
		basedir,
		formatHtml,
		layout,
		resolve,
		routes,
		servedir,
		srcdir,
	} = {
		...buildOptionsDefaults<Routes>(),
		...options,
	};

	const entryPoints: Array<{ in: string; out: string; }> = [];

	const splitPageRoutesByFilePaths: Record<string, string> = {};

	const routeNames = Object.keys(routes) as Array<keyof Routes>;

	await promiseConsecutive(
		routeNames.map(routeName => async() => {
			const routePath = routes[routeName];
			const hasExtension = matchExtension.test(routePath);
			let outPath = path.join(`/`, routePath).replace(/#.*$/, ``);
			if (!hasExtension) {
				outPath = path.join(outPath, `index.html`);
			}
			const outDir = path.join(basedir, servedir, path.dirname(outPath));
			const outPathAbsolute = path.join(outDir, path.basename(outPath));

			const fallbackTemplate = await resolve(routePath);
			const doFallback = !!(fallbackTemplate);
			if (doFallback) {
				const compiled = formatHtml(layout(fallbackTemplate));
				fs.mkdirSync(outDir, { recursive: true });
				fs.writeFileSync(outPathAbsolute, compiled);
			} else {
				console.warn(`Route '${routeName.toString()}' does not resolve to a template.`);
			}

			const pageTemplatePath = Page.importMetaUrl.last;
			const doSplitPage = !!(pageTemplatePath);
			if (doSplitPage) {
				const filePath = fileURLToPath(pageTemplatePath);
				entryPoints.push({ in: filePath, out: outPathAbsolute });
				splitPageRoutesByFilePaths[filePath] = outPath;
			}
		})
	);

	const pageResolver: esbuild.Plugin = {
		name: `Page dynamic import resolver`,
		setup(build) {
			build.onResolve({ filter: /^\.\.?\/.*/ }, args => {
				if (args.kind !== `dynamic-import`) {
					return null;
				}
				const importPath = path.join(basedir, srcdir, args.path);
				const splitPageRoute = splitPageRoutesByFilePaths[importPath];
				const doSplitPage = !!(splitPageRoute);
				if (doSplitPage) {
					return {
						external: true,
						path: splitPageRoute.startsWith(`/`)
							? `${splitPageRoute}.js`
							: `/${splitPageRoute}.js`,
					};
				}
			});
		},
	};

	return {
		entryPoints,
		plugins: [pageResolver],
	};
}

export async function build<Routes extends RouteMap>(
	options: BuildOptions<Routes>,
) {
	const {
		assetsdir,
		basedir,
		formatCss,
		servedir,
		srcdir,
	} = {
		...buildOptionsDefaults<Routes>(),
		...options,
	};

	fs.rmSync(path.join(basedir, servedir), { force: true, recursive: true });
	fs.mkdirSync(path.join(basedir, servedir));

	if (fs.existsSync(path.join(basedir, assetsdir))) {
		fs.cpSync(
			path.join(basedir, assetsdir),
			path.join(basedir, servedir, assetsdir),
			{ recursive: true }
		);
	}

	const stylesSrcPath = path.join(basedir, srcdir, `./styles.css.ts`);
	let styles = (await import(stylesSrcPath)).default as string; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
	styles = formatCss(styles);
	fs.writeFileSync(path.join(basedir, servedir, `styles.css`), styles);

	const vendorFile = `/web.js`;
	esbuild.buildSync({
		bundle: true,
		entryPoints: [`@robertakarobin/web/index.ts`],
		format: `esm`,
		outfile: path.join(basedir, servedir, vendorFile),
	});

	const { entryPoints, plugins } = await getBuildOptions(options);
	await esbuild.build({
		absWorkingDir: path.join(basedir, servedir),
		alias: {
			"@robertakarobin/web/index.ts": vendorFile,
		},
		bundle: true,
		entryPoints: [
			{
				in: path.join(basedir, srcdir, `./script.ts`),
				out: `script`,
			},
			...entryPoints,
		],
		external: [
			vendorFile,
		],
		format: `esm`,
		outdir: path.join(basedir, servedir),
		plugins: [
			...plugins,
		],
	});
}

export function serve<Routes extends RouteMap>(
	options: BuildOptions<Routes>
) {
	const {
		basedir,
		port,
		servedir,
	} = {
		...buildOptionsDefaults<Routes>(),
		...options,
	};

	void retryPort();
	async function retryPort() {
		(await esbuild.context({})).serve({
			port,
			servedir: path.join(basedir, servedir),
		}).then(() => {
			console.log(`Serving from ${path.join(basedir, servedir)} on http://localhost:${port}`);
		}).catch(error => {
			console.warn(error);
			void retryPort();
		});
	}
}

export function watchAndServe<Routes extends RouteMap>(
	options: BuildOptions<Routes>
) {
	const {
		basedir,
		srcdir,
	} = {
		...buildOptionsDefaults<Routes>(),
		...options,
	};

	fs.watch(
		path.join(basedir, srcdir),
		{ recursive: true },
		() => void build(options),
	);

	serve(options);
	void build(options);
}
