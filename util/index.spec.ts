import { run, suite, type Type } from './spec/index.ts';
import { glob } from 'glob';
import path from 'path';
import { promiseConsecutive } from './time/promiseConsecutive.ts';
import url from 'url';

const extensions = {
	spec: `.spec.ts`,
	ts: `.ts`,
};

const files = new Set(await glob(
	`util/**/*.ts`,
	{
		ignore: [
			`*/browser.spec.ts`,
			`*/svg/**/*`,
			`*/spec/**/*`,
		],
	}
));

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
		if (!files.has(`${base}${extensions.ts}`)) {
			specWithoutSource.push(file);
		}
	} else {
		const base = file.substring(0, file.length - extensions.ts.length);
		if (!files.has(`${base}${extensions.spec}`)) {
			sourceWithoutSpec.push(file);
		}
	}
}

console.log(`>>> Specs without source:`);
console.log(specWithoutSource.sort().map((entry, index) =>
	`${index}.\t${entry}\n`
).join(``));

console.log(`>>> Sources without spec:`);
console.log(sourceWithoutSpec.sort().map((entry, index) =>
	`${index}.\t${entry}\n`
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
	})
);

export const spec = suite(`@robertakarobin/util/`, {}, ...specs);

run(await spec({}), {
	format: (result, text) => {
		if (`status` in result) {
			if (result.status === `pass`) {
				return [``];
			}
		}
		return text;
	},
	verbose: true,
});
