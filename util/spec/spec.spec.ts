import { render, suite, test } from './index.ts';
import { diff } from './diff.ts';
import { sleep } from '../time/sleep.ts';

import * as dbTests from './example/db.spec.ts';
import * as mathTests from './example/math.spec.ts';

export const spec = suite(`SpecRunner`, {},
	suite(`example: math`,
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

	suite(`example: db`,
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

	(() => {
		const state = {
			suite1Args: {} as unknown,
			suite2Args: {} as unknown,
			test1Args: {} as { value1: string; value1_1: string; },
			test2Args: {} as { value1: string; value1_1: string; },
		};

		return suite(`args`,
			{
				args: () => ({
					value1: `foo`,
				}),
			},

			suite(`are ihnerited`,
				{
					args: args => {
						state.suite1Args = args;
						return args;
					},
				},

				test(`from parent suites`, ({ args, assert }) => {
					assert(() => args === state.suite1Args);
					assert(x => x(args.value1) === `foo`);
				}),
			),

			suite(`are reevaluated between siblings`,
				{
					args: args => {
						state.suite2Args = args;
						return {
							...args,
							value1_1: `${args.value1}bar`,
						};
					},
				},

				test(`suites`, ({ args, assert }) => {
					assert(x =>
						x(JSON.stringify(state.suite1Args)) === x(JSON.stringify(state.suite2Args)),
					);
					assert(() => state.suite1Args !== state.suite2Args);

					state.test1Args = args;
					args.value1 = `no longer foo`;
					assert(x => x(args.value1_1) === `foobar`);
				}),

				test(`tests`, ({ args, assert }) => {
					state.test2Args = args;

					assert(x => x(state.test1Args.value1) === `no longer foo`);
					assert(x => x(state.test2Args.value1) === `foo`);
					assert(x => x(state.test2Args.value1_1) === `foobar`);
				}),
			),
		);
	})(),

	(() => {
		const state = {
			suiteIteration: 0,
			testArgs_last: {} as unknown,
		};

		return suite(`iterations`, {},
			suite(`of suite`,
				{
					args: () => {
						state.suiteIteration += 1;
						return {
							iteration: 1,
						};
					},
					iterations: 3,
				},

				test(`resets args`, ({ args, assert }) => {
					assert(x =>	 x(args.iteration) === 1);
					args.iteration += 1;

					assert(() => args !== state.testArgs_last);
					state.testArgs_last = args;
				}),
			),

			test(`of suite repeats suite`, ({ assert }) => {
				assert(x => x(state.suiteIteration) === 3);
			}),

			suite(`of tests`, {},

			),
		);
	})(),

	suite(`suite timing`, {},
		...(() => {
			const state = {
				value: `state1`,
			};

			return [
				suite(`when concurrent`,
					{
						args: () => ({
							value: `args1`,
						}),
						timing: `concurrent`,
					},

					test(`args are unaffected`, async({ args, assert }) => {
						assert(x => x(state.value) === `state1`);
						assert(x => x(args.value) === `args1`);

						await sleep(100);

						assert(x => x(state.value) === `state2`);
						assert(x => x(args.value) === `args1`);
					}),

					test(`tests start at the same time`, ({ args, assert }) => {
						assert(x => x(state.value) === `state1`);
						assert(x => x(args.value) === `args1`);

						state.value = `state2`;
						args.value = `args2`;
					}),
				),

				suite(`when consecutive`,
					{
						args: () => ({
							value: `args1`,
						}),
						timing: `consecutive`,
					},

					test(`args are unaffected`, async({ args, assert }) => {
						assert(x => x(state.value) === `state2`);
						assert(x => x(args.value) === `args1`);

						await sleep(100);

						assert(x => x(state.value) === `state2`);
						assert(x => x(args.value) === `args1`);

						state.value = `state3`;
					}),

					test(`tests run in order`, ({ args, assert }) => {
						assert(x => x(state.value) === `state3`);
						assert(x => x(args.value) === `args1`);

						state.value = `state4`;
						args.value = `args4`;
					}),
				),
			];
		})(),
	),
);
