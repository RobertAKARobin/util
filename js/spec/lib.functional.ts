import * as $ from 'js/util';

import * as Type from './types';

export const Assertion = {
	new(
		callback: Type.Assertion[`callback`],
		options: Partial<Type.AssertionOptions> = {},
	): Type.Assertion {
		return {} as Type.Assertion;
	},

	run(
		assertion: Type.Assertion,
		runtimeOptions: Partial<Type.AssertionOptions> = {},
	): $.Type.PromiseMaybe<Type.AssertionResult> {
		const options = {
			...assertion.options,
			...runtimeOptions,
		};
		return {} as Type.AssertionResult;
	},
};

export const Test = {
	new(
		title: string,
		callback: Type.Test[`callback`],
		options: Partial<Type.TestOptions> = {}
	): Type.Test {
		return {} as Type.Test;
	},

	async run(
		test: Type.Test,
		runtimeOptions: Partial<Type.TestOptions> = {}
	): Promise<Type.TestResult> {
		const children: Type.TestResult[`children`] = [];
		await test.callback({
			assert: async(
				...args: Parameters<typeof Assertion.new>
			) => {
				const assertion = Assertion.new(...args);
				const result = await Assertion.run(
					assertion,
					{
						...test.options,
						...runtimeOptions,
						...assertion.options,
					}
				);
				children.push(result);
			},
		});
		return {} as Type.TestResult;
	},
};

export const Suite = {
	isInstance(input: Type.SpecStep) {
		return !(`beforeEaches` in input);
	},

	new(
		title: string,
		callback: Type.Suite[`callback`],
		options: Partial<Type.SuiteOptions> = {}
	): Type.Suite {
		callback({
			beforeEach: (beforeEachCallback) => ({}),
			suite: Suite.new,
			test: Test.new,
		});
		return {} as Type.Suite;
	},

	async run(
		suite: Type.Suite,
		runtimeOptions: Partial<Type.SuiteOptions> = {},
	): Promise<Type.SuiteResult> {
		const beforeEach = () => suite.beforeEaches.reduce(
			async(previous, beforeEach) => previous.then(beforeEach),
			Promise.resolve()
		);

		const children: Type.SuiteResult[`children`] = [];
		await suite.children.reduce(async(previous, child) => {
			await previous;
			await beforeEach();
			const result = await (
				Suite.isInstance(child)
					? Suite.run(child as Type.Suite)
					: Test.run(child as Type.Test)
			);
			children.push(result);
		}, Promise.resolve());

		return {
			children,
			resultType: `error`,
		};
	},
};
