import * as Diff from 'diff';

import { render, suite, test } from '@robertakarobin/spec';

import * as dbTests from './example/db.spec.ts';
import * as mathTests from './example/math.spec.ts';

export const spec = suite(`SpecRunner`, {},
	suite(`math`,
		{
			args: async() => {
				const expected = mathTests.expected.trim();
				const results = await mathTests.specs({});
				const actual = render(results, { showTiming: false }).trim();
				return {
					actual,
					expected,
				};
			},
		},

		test(`rendered results match expected`, ({ args, assert }) => {
			assert(x => x(showDiff(args.expected, args.actual)) === ``);
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
			? `\x1b[36m${result}\x1b[0m`
			: `\x1b[35m${result}\x1b[0m`;
	}).join(``);
}
