import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import fs from 'fs';
import jsBeautify from 'js-beautify';
import path from 'path';
import { promiseConsecutive } from '@robertakarobin/jsutil';

import { pageTemplatePath } from '@robertakarobin/web';

import resolve from './routes-static.ts';
import { routes } from './routes.ts';

const matchExtension = /\.\w+$/;
const trimFile = (input: string) => input.trim().replace(/[\n\r]+/g, ``);

const baseDir = path.join(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(baseDir, `dist`);

fs.rmSync(distDir, { force: true, recursive: true });
fs.mkdirSync(distDir);

const styles = jsBeautify.css(
	trimFile((await import(`./styles.css.ts`)).default),
	{
		end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
		indent_with_tabs: true,
	}
);
fs.writeFileSync(path.join(distDir, `styles.css`), styles);

const vendorFile = `/web.js`;
esbuild.buildSync({
	bundle: true,
	entryPoints: [`@robertakarobin/web/index.ts`],
	format: `esm`,
	outfile: path.join(distDir, vendorFile),
});

const buildOptions: esbuild.BuildOptions = {
	absWorkingDir: distDir,
	alias: {
		"@robertakarobin/web": vendorFile,
	},
	bundle: true,
	entryPoints: [
		{ in: path.join(baseDir, `./script.ts`), out: `script` },
	],
	external: [
		vendorFile,
	],
	format: `esm`,
	outdir: distDir,
};

const splitPageRoutesByFilePaths: Record<string, string> = {};

await promiseConsecutive(
	Object.keys(routes).map(routeName => async() => {
		const routePath = routes[routeName as keyof typeof routes];
		const hasExtension = matchExtension.test(routePath);
		let outPath = path.join(`/`, routePath);
		if (!hasExtension) {
			outPath = path.join(outPath, `index.html`);
		}
		const outDir = path.join(distDir, path.dirname(outPath));
		const outPathAbsolute = path.join(outDir, path.basename(outPath));

		const template = await resolve(routePath);
		const compiled = jsBeautify.html(trimFile(template), {
			end_with_newline: true, // TODO2: Once we're using editorconfig, use the `--editorconfig` option
			indent_with_tabs: true,
		});
		fs.mkdirSync(outDir, { recursive: true });
		fs.writeFileSync(outPathAbsolute, compiled);

		const templatePath = pageTemplatePath.last;
		const doSplitPage = !!(templatePath);
		if (doSplitPage) {
			const filePath = fileURLToPath(templatePath);
			(buildOptions.entryPoints! as Array<{ in: string; out: string; }>).push({
				in: filePath,
				out: outPathAbsolute,
			});
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
			const importPath = path.join(baseDir, args.path);
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

buildOptions.plugins = [pageResolver];
await esbuild.build(buildOptions);

if (process.argv.includes(`--serve`)) {
	const port = 3000;
	void retryPort();
	async function retryPort() {
		(await esbuild.context({})).serve({
			port,
			servedir: distDir,
		}).then(() => {
			console.log(`Serving at http://localhost:${port}`);
		}).catch(() => {
			void retryPort();
		});
	}
}
