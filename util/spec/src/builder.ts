import type * as $ from '../../types.d.ts';
import { arrayToEnum } from '../../group/arrayToEnum.ts';
import { nTimes } from '../../group/nTimes.ts';
import { promiseConsecutive } from '../../time/promiseConsecutive.ts';

import type * as Type from './types.d.ts';

const specStepCountDefault: Type.SpecStepCount = {
	deferred: 0,
	fail: 0,
	pass: 0,
	totalAssertions: 0,
};

export const specStepStatuses = [
	`deferred`,
	`pass`,
	`fail`,
] as const;

export const SpecStepStatus = arrayToEnum([ ...specStepStatuses ]);

export const specStepTiming = [
	`concurrent`,
	`consecutive`,
] as const;

export const specStepTypes = [
	`log`,
	`assertion`,
	`test`,
	`testIteration`,
	`suite`,
	`suiteIteration`,
] as const;

export class SpecBuilder {
	constructor() {
		this.log = this.log.bind(this); // Typescript doesn't yet support overloads for arrow functions https://github.com/microsoft/TypeScript/issues/47669
		this.suite = this.suite.bind(this);
	}

	assert(
		assertion: (valueWrap: typeof Type.AssertionValueWrap) => boolean
	): Type.AssertionResult;
	assert(
		assertion: (valueWrap: typeof Type.AssertionValueWrap) => Promise<boolean>
	): Promise<Type.AssertionResult>;
	assert(
		assertion: (valueWrap: typeof Type.AssertionValueWrap) => $.PromiseMaybe<boolean>,
	): $.PromiseMaybe<Type.AssertionResult> {
		const result: Type.AssertionResult = {
			contents: assertion.toString(),
			indexAtDefinition: NaN,
			status: `pass`,
			timeBegin: this.getTime(),
			timeEnd: NaN,
			type: `assertion`,
			values: [],
		};

		const assertionValueWrap: typeof Type.AssertionValueWrap = <Value>(value: Value) => {
			result.values.push(`${value as string}`);
			return value;
		};

		const setResult = (assertionValue: boolean) => {
			if (assertionValue === false) {
				result.status = `fail`;
			} else if (assertionValue === true) {
				result.status = `pass`;
			} else {
				throw new TypeError(`Returned ${typeof assertionValue}; assertions must return boolean.`);
			}

			result.timeEnd = this.getTime();

			return result;
		};

		const assertionValue = assertion(assertionValueWrap);

		if (assertionValue instanceof Promise) {
			return assertionValue.then(setResult);
		} else {
			return setResult(assertionValue);
		}
	}

	count(...children: Array<Type.SpecStepResult>) {
		const result: Type.SpecStepResultCount = {
			count: { ...specStepCountDefault },
			status: `pass`,
			timeBegin: children[0]?.timeBegin ?? NaN,
			timeEnd: children[children.length - 1]?.timeEnd ?? NaN,
		};

		for (const child of children) {
			if (SpecStepStatus[child.status] > SpecStepStatus[result.status]) {
				result.status = child.status;
			}

			for (const status in result.count) {
				const count = child.count[status as Type.SpecStepStatusName];
				result.count[status as Type.SpecStepStatusName] += count;
			}
		}

		return result;
	}

	getTime(): number {
		return performance.now();
	}

	log(message: () => unknown): Type.SpecLog;
	log(message: () => Promise<unknown>): Promise<Type.SpecLog>;
	log(message: string): Type.SpecLog;
	log(
		message: string | (() => $.PromiseMaybe<unknown>),
	): $.PromiseMaybe<Type.SpecLog> {
		const logResult = () => ({
			message: (typeof message === `string` ? message : message.toString()),
			time: this.getTime(),
			type: `log`,
		} as Type.SpecLog);

		if (message instanceof Function) {
			const output = message();
			if (output instanceof Promise) {
				return output.then(logResult);
			}
		}
		return logResult();
	};

	suite<InheritedArgs, Args>(
		title: string,
		options: Partial<Type.SuiteOptions<InheritedArgs, Args>>,
		...children: Array<
			(args: Args) => Promise<Type.SuiteResult | Type.TestResult>
		>
	): (inheritedArgs: InheritedArgs) => Promise<Type.SuiteResult>;

	suite<InheritedArgs, Args>(
		title: string,
		options: Partial<Omit<Type.SuiteOptions<InheritedArgs, Args>, `args`>>,
		...children: Array<
			(args: InheritedArgs) => Promise<Type.SuiteResult | Type.TestResult>
		>
	): (inheritedArgs: InheritedArgs) => Promise<Type.SuiteResult>;

	suite<InheritedArgs, Args>(
		title: string,
		options: Partial<Type.SuiteOptions<InheritedArgs, Args>>,
		...children: Array<
			(args: Args | InheritedArgs) => Promise<Type.SuiteResult | Type.TestResult>
		>
	): (
			inheritedArgs: InheritedArgs,
			index: number,
		) => Promise<Type.SuiteResult> {
		return async(inheritedArgs, index) => {
			const args = typeof options?.args === `function`
				? () => options.args!(inheritedArgs) // eslint-disable-line
				: () => ({ ...inheritedArgs });

			const timing = options.timing || `concurrent`;

			const iterations = nTimes(
				isNaN(options.iterations as number) ? 1 : options.iterations as number,
				(_nil, index) => () => this.suiteIteration({
					args,
					children,
					index,
					timing,
				}),
			);

			const results = (timing === `consecutive`
				? await promiseConsecutive(iterations)
				: await Promise.all(iterations.map(iteration => iteration()))
			);

			const count = this.count(...results);

			return {
				indexAtDefinition: isNaN(index) ? 0 : index,
				iterations: results,
				timing,
				title,
				type: `suite`,
				...count,
			};
		};
	}

	async suiteIteration<Args>(input: {
		args: () => $.PromiseMaybe<Args>;
		children: Array<
			(args: Args, index: number) => Promise<Type.SuiteResult | Type.TestResult>
		>;
		index: number;
		timing: Type.SpecStepTiming;
	}): Promise<Type.SuiteIterationResult> {
		const results: Array<Type.SuiteResult | Type.TestResult> = (input.timing === `consecutive`
			? await promiseConsecutive(
				input.children.map(child => async(_nil, index) => child(await input.args(), index)),
			)
			: await Promise.all(
				input.children.map(async(child, index) => child(await input.args(), index)),
			)
		);

		const count = this.count(...results);

		return {
			children: results,
			indexAtDefinition: input.index || 0,
			type: `suiteIteration`,
			...count,
		};
	}

	test = <Args>( // TODO2: Error on suites or tests inside of tests
		title: string,
		testDefinition: typeof Type.TestDefinition<Args>,
		options: Partial<Type.TestOptions> = {},
	): typeof Type.Test<Args> => {
		return async(args, index) => {
			const timing = options.timing || `concurrent`;

			const iterations = nTimes(
				isNaN(options.iterations as number) ? 1 : options.iterations as number,
				(_nil, index) => () => this.testIteration<Args>({
					args,
					index,
					testDefinition,
				}),
			);

			const results = (timing === `consecutive`
				? await promiseConsecutive(iterations)
				: await Promise.all(iterations.map(iteration => iteration()))
			);

			const count = this.count(...results);

			return {
				indexAtDefinition: isNaN(index as number) ? 0 : index as number,
				iterations: results,
				timing,
				title,
				type: `test`,
				...count,
			};
		};
	};

	async testIteration<Args>(input: {
		args: Args;
		index: number;
		testDefinition: typeof Type.TestDefinition<Args>;
	}): Promise<Type.TestIterationResult> {
		const result: Type.TestIterationResult = {
			children: [],
			count: { ...specStepCountDefault },
			indexAtDefinition: input.index,
			status: `pass`,
			timeBegin: this.getTime(),
			timeEnd: NaN,
			type: `testIteration`,
		};

		let assertionIndex = 0;

		const setResult = (assertionResult: Type.AssertionResult) => {
			assertionResult.indexAtDefinition = assertionIndex;
			assertionIndex += 1;

			if (SpecStepStatus[assertionResult.status] > SpecStepStatus[result.status]) {
				result.status = assertionResult.status;
			}

			result.count[assertionResult.status] += 1;
			result.count.totalAssertions += 1;

			result.children.push(assertionResult);
		};

		const getAssertionResult = (...args: Parameters<typeof this.assert>) => {
			const assertionResult = this.assert(...args);

			if (assertionResult instanceof Promise) {
				return assertionResult.then(setResult);
			} else {
				return setResult(assertionResult);
			}
		};

		const log: typeof Type.SpecLogFactory = message => {
			result.children.push(this.log(message as Parameters<typeof this.log>[0]));
		};

		await input.testDefinition({
			args: input.args,
			assert: getAssertionResult as typeof Type.AssertionFactory,
			log,
		});

		result.timeEnd = this.getTime();

		return result;
	}
}
