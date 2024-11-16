import { glob } from 'glob';
import path from 'path';
import url from 'url';

import { print, type Type } from './spec/index.ts';
import { cliArgs } from './node/cliArgs.ts';
import { keysOf } from './group/keysOf.ts';
import { specRunNative } from './spec/src/runner.native.ts';
import { specRunWeb } from './spec/src/runner.web.ts';
import { substringBetween } from './string/substringBetween.ts';

const platforms = {
	node: {
		extension: `.node.ts`,
		runner: specRunNative,
	},
	web: {
		extension: `.web.ts`,
		runner: specRunWeb,
	},
} satisfies Type.SpecRunnerMap;

const platformNames = keysOf(platforms);

const filenamesByPlatformName = {} as Record<keyof typeof platforms, Array<string>>;
for (const platformName of platformNames) {
	filenamesByPlatformName[platformName] = [];
}

const [args, ...targetFiles] = cliArgs<{
	platform: keyof typeof platforms;
	verbose: string;
}>(process.argv.slice(2));

const filenames = (await glob(
	targetFiles.length === 0 ? `*/**/*.ts` : targetFiles,
	{
		ignore: [
			`dist/**/*`,
			`example/**/*`,
			`util/browser.spec.ts`,
			`util/index.spec.ts`,
			`util/const/**/*`,
			`util/spec/example/**/*`, // Run by spec/spec.spec.ts
			`util/svg/**/*`,
			`**/node_modules/**/*`,
			`**/*.d.ts`,
		],
	},
)).sort();

const files = {} as Record<string, {
	source?: string;
	spec?: string; // TODO3: Multiple spec platforms for one source?
}>;
const thisFile = url.fileURLToPath(import.meta.url);

for (const filename of filenames) {
	if (path.resolve(filename) === thisFile) {
		continue;
	}

	const fileBase = substringBetween(filename, { end: /\.spec|\.ts/ })!;
	const file = files[fileBase] = files[fileBase] ?? {};

	if (filename.includes(`.spec`)) {
		file.spec = filename;

		const targetPlatform = platformNames.find(platformName => {
			const platform = platforms[platformName];
			return filename.endsWith(platform.extension);
		});

		if (targetPlatform === undefined) {
			for (const platformName of platformNames) {
				filenamesByPlatformName[platformName].push(filename);
			}
		} else {
			filenamesByPlatformName[targetPlatform].push(filename);
		}
	} else {
		file.source = filename;
	}
}

console.log(`>>> Specs without source:`);
Object.values(files)
	.filter(file => file.spec !== undefined && file.source === undefined)
	.forEach((file, index) => console.log(`${index + 1}.\t${file.spec}`));

console.log(`>>> Sources without spec:`);
Object.values(files)
	.filter(file => file.spec === undefined && file.source !== undefined)
	.forEach((file, index) => console.log(`${index + 1}.\t${file.source}`));

const targetPlatformNames = `platform` in args
	? [args.platform]
	: platformNames;

for (const platformName of targetPlatformNames) {
	const filenames = filenamesByPlatformName[platformName];
	if (filenames.length === 0) {
		continue;
	}

	const runner = platforms[platformName].runner;
	const rootResult = await runner(filenames, {
		timing: `consecutive`, // `concurrent` causes timing issues, e.g. blocking FPSLoop until another test completes which throws off FPSLoop's timers
	});

	const basedir = `file://` + process.cwd();
	print(rootResult, {
		format: (result, text) => {
			if (args.verbose) {
				return text;
			}

			if (result.type === `suite` || result.type === `test`) {
				if (typeof text[0] === `string`) {
					text[0] = text[0].replace(basedir, ``);
				}
			}

			if (rootResult.status === `pass`) {
				if (result.type === `suite` || result.type === `test`) {
					return text;
				}

				return [``];
			}

			if (`status` in result && result.status === `fail`) {
				return text;
			}

			return [``];
		},
		verbose: true,
	});

	if (rootResult.status === `fail`) {
		process.exit(1);
	}
}

process.exit(0);
