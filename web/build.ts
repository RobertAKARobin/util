import * as esbuild from 'esbuild';
import * as fs from 'fs';
import { globSync } from 'glob';
import path from 'path';

import type * as Type from './types.d.ts';

type TemplateStringWithFilename = [string, string];

export const buildOptionsDefaults = {
	baseDir: process.cwd(),
	distDir: `dist`,
	statics: [] as Array<
		| TemplateStringWithFilename
		| string
	>,
};

const log = (
	type: `file` | `path` | `string`,
	inputPath?: string,
	outputPath?: string,
) => {
	console.log([
		type,
		inputPath,
		outputPath,
		``,
	].join(`\n`));
};

/**
 * @param routes A map of all the routes defined for this app, where keys are the route names and the values are the route paths to which they correspond
 * @param resolver Converts a route path to a template that should be rendered
 * @param inputOptions.baseDir All input paths are relative to this directory. TODO2: Hande absolute paths
 * @param inputOptions.distDir All output paths are relative to this directory
 * @param inputOptions.statics Paths of files that should be built and that won't be reached by the resolver
 */
export async function build(
	routes: Type.Routes,
	resolver: Type.Resolver,
	inputOptions: Partial<Type.BuildOptions> = {}
) {
	const entryPoints: Array<string> = [];
	const options: Type.BuildOptions = {
		...buildOptionsDefaults,
		...inputOptions,
	};
	fs.rmSync(options.distDir, { force: true, recursive: true });
	fs.mkdirSync(options.distDir);

	for (const staticInput of options.statics) {
		if (Array.isArray(staticInput)) {
			const [templateString, filePath] = staticInput;
			const outPath = path.join(options.distDir, filePath);
			fs.mkdirSync(path.dirname(outPath), { recursive: true });
			fs.writeFileSync(outPath, templateString);
			const templatePreview = templateString.substring(0, 50).replace(/\s+/g, ` `);
			log(`string`, `${templatePreview}...`, outPath);
		} else {
			const fileGlob = staticInput;
			const filePaths = globSync(
				path.join(options.baseDir, fileGlob),
				{ nodir: true },
			);
			for (const filePath of filePaths) {
				let outPath = path.join(
					options.distDir,
					filePath.replace(options.baseDir, ``)
				);
				if (filePath.endsWith(`.ts`)) {
					const parsed = path.parse(outPath);
					outPath = path.join(
						parsed.dir,
						parsed.name,
					) + `.js`;
					entryPoints.push(filePath);
				} else {
					fs.cpSync(filePath, outPath);
				}
				log(`file`, filePath, outPath);
			}
		}
	}

	await Promise.all(Object.keys(routes).map(async routeName => {
		const routePath = routes[routeName];
		if (typeof routePath !== `string`) {
			return;
		}
		const template = await resolver(routePath);
		const outName = routePath === `/` ? `index` : routePath;
		const outDir = path.join(options.distDir, path.dirname(routePath));
		const outPath = path.join(outDir, `${outName}.html`);
		fs.mkdirSync(outDir, { recursive: true });
		fs.writeFileSync(outPath, template);
		log(`path`, routePath, outPath);
	}));

	return await esbuild.context({
		bundle: true,
		entryPoints,
		outdir: options.distDir,
	});
}
