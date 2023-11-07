import type esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { promiseConsecutive } from '@robertakarobin/jsutil';

import { matchExtension, Page, type Resolver, type RouteMap } from './index.ts';

export async function getBuildOptions<Routes extends RouteMap>(options: {
	baseDir: string;
	distDir: string;
	formatHtml?: (input: string) => string;
	resolve: Resolver<Routes>;
	routes: Routes;
}) {
	const entryPoints: Array<{ in: string; out: string; }> = [];

	const splitPageRoutesByFilePaths: Record<string, string> = {};

	const routeNames = Object.keys(options.routes) as Array<keyof Routes>;

	await promiseConsecutive(
		routeNames.map(routeName => async() => {
			const routePath = options.routes[routeName];
			const hasExtension = matchExtension.test(routePath);
			let outPath = path.join(`/`, routePath);
			if (!hasExtension) {
				outPath = path.join(outPath, `index.html`);
			}
			const outDir = path.join(options.distDir, path.dirname(outPath));
			const outPathAbsolute = path.join(outDir, path.basename(outPath));

			const fallbackTemplate = await options.resolve(routePath);
			const doFallback = !!(fallbackTemplate);
			if (doFallback) {
				const compiled = options.formatHtml
					? options.formatHtml(fallbackTemplate)
					: fallbackTemplate;
				fs.mkdirSync(outDir, { recursive: true });
				fs.writeFileSync(outPathAbsolute, compiled);
			}

			const templatePath = Page.templatePath.last;
			const doSplitPage = !!(templatePath);
			if (doSplitPage) {
				const filePath = fileURLToPath(templatePath);
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
				const importPath = path.join(options.baseDir, args.path);
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
