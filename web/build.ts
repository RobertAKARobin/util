import type esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { promiseConsecutive } from '@robertakarobin/jsutil';

import type * as Type from './types.d.ts';
import { matchExtension, Page } from './index.ts';

export async function getBuildOptions(options: {
	baseDir: string;
	distDir: string;
	formatHtml?: (input: string) => string;
	resolve: Type.Resolver;
	routes: Type.Routes;
}) {
	const entryPoints: Array<{ in: string; out: string; }> = [];

	const splitPageRoutesByFilePaths: Record<string, string> = {};

	await promiseConsecutive(
		Object.keys(options.routes).map(routeName => async() => {
			const routePath = options.routes[routeName as keyof typeof options.routes] as string;
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
