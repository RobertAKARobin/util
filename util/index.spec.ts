import { glob } from 'glob';
import path from 'path';
import url from 'url';

import { run, suite, type Type } from './spec/index.ts';
import { promiseConsecutive } from './time/promiseConsecutive.ts';

const extensions = {
	spec: `.spec.ts`,
	ts: `.ts`,
};

const fileNames = await glob(
	`*/**/*.ts`,
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
		],
	},
);
const files = new Set(fileNames.sort());

const specFiles = [];
const specWithoutSource = [] as Array<string>;
const sourceWithoutSpec = [] as Array<string>;
const thisFile = url.fileURLToPath(import.meta.url);

for (const file of files) {
	if (path.resolve(file) === thisFile) {
		continue;
	}

	if (file.endsWith(extensions.spec)) {
		specFiles.push(file);

		const base = file.substring(0, file.length - extensions.spec.length);
		if (files.has(`${base}${extensions.ts}`) === false) {
			specWithoutSource.push(file);
		}
	} else {
		const base = file.substring(0, file.length - extensions.ts.length);
		if (files.has(`${base}${extensions.spec}`) === false) {
			sourceWithoutSpec.push(file);
		}
	}
}

console.log(`>>> Specs without source:`);
console.log(specWithoutSource.map((entry, index) =>
	`${index}.\t${entry}\n`,
).join(``));

console.log(`>>> Sources without spec:`);
console.log(sourceWithoutSpec.map((entry, index) =>
	`${index}.\t${entry}\n`,
).join(``));

const specs = await promiseConsecutive(
	specFiles.sort().map(file => async() => {
		const { spec } = await import(file) as {
			spec: typeof Type.Test;
		};
		if (typeof spec !== `function`) {
			throw new Error(file);
		}
		return spec;
	}),
);

export const spec = suite(`@robertakarobin/util/`, {
	timing: `consecutive`,
}, ...specs);
const basedir = `file://` + process.cwd();

const rootResult = await spec({});
run(rootResult, {
	format: (result, text) => {
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
