import esbuild from 'esbuild';
import path from 'path';

esbuild.buildSync({
	bundle: true,
	entryPoints: [`./index.ts`],
	format: `esm`,
	outfile: path.join(process.cwd(), `./dist/index.js`),
});
