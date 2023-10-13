import * as Diff from 'diff';
import colors from 'colors/safe';

import { render, suite, test } from '@robertakarobin/spec';

import * as dbTests from './example/db.spec.ts';
import * as mathTests from './example/math.spec.ts';

export const spec = suite(`SpecRunner`, {},
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
