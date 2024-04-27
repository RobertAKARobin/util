import { render, suite, test } from './index.ts';
import { diff } from './diff.ts';

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
			assert(x => x(diff(args.expected, args.actual)) === ``);
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
			assert(x => x(diff(args.expected, args.rendered)) === ``);
		}),
	),
);
