import CleanCSS from 'clean-css';
import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import pretty from 'pretty';
import { promiseConsecutive } from '@robertakarobin/jsutil';

import { layout, pageStatic, title } from '@robertakarobin/web';

import { resolve, routes } from './routes.ts';

const baseDir = path.join(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(baseDir, `dist`);

fs.rmSync(distDir, { force: true, recursive: true });
fs.mkdirSync(distDir);

const cleanCss = new CleanCSS({ format: `beautify` });
const styles = cleanCss.minify((await import(`./styles.css.ts`)).default).styles;
fs.writeFileSync(path.join(distDir, `styles.css`), styles);

const vendorFile = `/web.js`;
esbuild.buildSync({
	bundle: true,
	entryPoints: [`@robertakarobin/web/index.ts`],
	format: `esm`,
	outfile: path.join(distDir, vendorFile),
});

type DynamicResolver = (
	args: esbuild.OnResolveArgs
) => void | Partial<esbuild.ResolveResult>;
const dynamicResolvers: Array<DynamicResolver> = [];

await promiseConsecutive(
	Object.keys(routes).map(routeName => async() => {
		const routePath = routes[routeName as keyof typeof routes];
		const outName = routePath === `/` ? `index` : routePath;
		const outDir = path.join(distDir, path.dirname(routePath));
		const outHtml = path.join(outDir, `${outName}.html`);

		const contents = await resolve(routePath);
		const template = await layout.last({
			contents,
			routePath,
			title: title.last,
		});
		const compiled = pretty(template, { ocd: true });
		fs.mkdirSync(outDir, { recursive: true });
		fs.writeFileSync(outHtml, compiled);

		const sourcePath = pageStatic.last;
		if (!sourcePath) {
			return;
		}

		const filePath = fileURLToPath(sourcePath);
		dynamicResolvers.push(args => {
			const importPath = path.join(baseDir, args.path);
			const pathDifference = path.relative(filePath, importPath);
			if (!pathDifference) {
				return {
					external: true,
					path: `/${outName}.js`,
				};
			}
		});
	})
);

const pageResolver: esbuild.Plugin = {
	name: `Page dynamic import resolver`,
	setup(build) {
		build.onResolve({ filter: /^\.\.?\/.*/ }, args => {
			if (args.kind !== `dynamic-import`) {
				return null;
			}
			for (const dynamicResolver of dynamicResolvers) {
				const match = dynamicResolver(args);
				if (match) {
					return match;
				}
			}
		 });
	},
};

await esbuild.build({
	absWorkingDir: distDir,
	alias: {
		"@robertakarobin/web": vendorFile,
	},
	bundle: true,
	entryPoints: [
		path.join(baseDir, `./script.ts`),
	],
	external: [
		vendorFile,
	],
	format: `esm`,
	outfile: path.join(distDir, `script.js`),
	plugins: [pageResolver],
});

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
