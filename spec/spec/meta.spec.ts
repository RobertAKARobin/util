import * as Diff from 'diff';
import colors from 'colors/safe';

import { render, run, suite, test } from '../index.ts';

import * as dbTests from '../example/db.spec.ts';
import * as mathTests from '../example/math.spec.ts';

const metaSpec = suite(`SpecRunner`, {},
	suite(`math`,
		{
			args: async() => {
				const expected = mathTests.expected.trim();
				const results = await mathTests.specs({});
				const rendered = render(results, { showTiming: false }).trim();
				return {
					expected,
					rendered,
				};
			},
		},

		test(`rendered results match expected`, ({ args, assert }) => {
			assert(x => x(showDiff(args.expected, args.rendered)) === ``);
		}),
	),

	suite(`db`,
		{
			args: async() => {
				const expected = dbTests.expected.trim();
				const results = await dbTests.specs({});
				const rendered = render(results, { showTiming: false }).trim();
				return {
					expected,
					rendered,
				};
			},
		},

		test(`rendered results match expected`, ({ args, assert }) => {
			assert(x => x(showDiff(args.expected, args.rendered)) === ``);
		}),
	),
);

run(await metaSpec({}));

function showDiff(expected: string, actual: string): string {
	const diff = Diff.diffLines(expected, actual);
	if (diff.length === 1) {
		return ``;
	}

	return diff.map(line => {
		const result = line.value;

		if (!line.added && !line.removed) {
			return result;
		}

		return line.added
			? colors.green(result)
			: colors.red(result);
	}).join(``);
}
