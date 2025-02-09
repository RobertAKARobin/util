/**
 * @import * as $ from '../../types.d';
 * @import * as Type from './types.d';
 */

import { arrayToEnum } from '../../group/arrayToEnum';
import { isNotNull } from '../../isNotNull';
import { nTimes } from '../../group/nTimes';
import { promiseConsecutive } from '../../time/promiseConsecutive';

/** @type {Type.SpecStepCount} */
const specStepCountDefault = {
	deferred: 0,
	fail: 0,
	pass: 0,
	totalAssertions: 0,
};

export const specStepStatuses = /** @type {const} */([
	`deferred`,
	`pass`,
	`fail`,
]);

export const SpecStepStatus = arrayToEnum([ ...specStepStatuses ]);

export const specStepTiming = /** @type {const} */([
	`concurrent`,
	`consecutive`,
]);

export const specStepTypes = /** @type {const} */([
	`log`,
	`assertion`,
	`test`,
	`testIteration`,
	`suite`,
	`suiteIteration`,
]);

// TODO2: Not really any advantage to this being a class with instance methods, except being able to subclass. Use a different structure?
export class SpecBuilder {
	constructor() {
		this.count = this.count.bind(this);
		this.log = this.log.bind(this); // Typescript doesn't yet support overloads for arrow functions https://github.com/microsoft/TypeScript/issues/47669
		this.suite = this.suite.bind(this);
		this.test = this.test.bind(this);
	}

	/**
	 * asdf
	 * @overload
	 * @param {(valueWrap: typeof Type.AssertionValueWrap) => boolean} assertion
	 * @returns {Type.AssertionResult}
	 */
	/**
	 * @overload
	 * @param {(valueWrap: typeof Type.AssertionValueWrap) => Promise<boolean>} assertion
	 * @returns {Promise<Type.AssertionResult>}
	 */
	/**
	 * @param {(valueWrap: typeof Type.AssertionValueWrap) => $.PromiseMaybe<boolean>} assertion
	 * @returns {$.PromiseMaybe<Type.AssertionResult>}
	 */
	assert(assertion) {
		/** @type {Type.AssertionResult} */
		const result = {
			contents: assertion.toString(),
			indexAtDefinition: NaN,
			status: `pass`,
			timeBegin: this.getTime(),
			timeEnd: NaN,
			type: `assertion`,
			values: [],
		};

		/** @type {Type.AssertionValueWrap} */
		const assertionValueWrap = value => {
			result.values.push(`${value}`);
			return value;
		};

		const setResult = (/** @type {boolean} */assertionValue) => {
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

	/**
	 * asdf
	 * @param {Array<Type.SpecStepResult>} children
	 * @returns {Type.SpecStepResultCount}
	 */
	count(...children) {
		/** @type {Type.SpecStepResultCount} */
		const result = {
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
				const statusName = /** @type {Type.SpecStepStatusName} */(status);
				const count = child.count[statusName];
				result.count[statusName] += count;
			}
		}

		return result;
	}

	/**
	 * asdf
	 * @returns {number}
	 */
	getTime() {
		return performance.now();
	}

	/**
	 * asdf
	 * @overload
	 * @param {() => unknown} message
	 * @returns {Type.SpecLog}
	 */
	/**
	 * @overload
	 * @param {() => Promise<unknown>} message
	 * @returns {Promise<Type.SpecLog>}
	 */
	/**
	 * @overload
	 * @param {string} message
	 * @returns {Type.SpecLog}
	 */
	/**
	 * @param {string | (() => $.PromiseMaybe<unknown>)} message
	 * @returns {$.PromiseMaybe<Type.SpecLog>}
	 */
	log(message) {
		/** @type {() => Type.SpecLog} */
		const logResult = () => ({
			message: (typeof message === `string` ? message : message.toString()),
			time: this.getTime(),
			type: `log`,
		});

		if (message instanceof Function) {
			const output = message();
			if (output instanceof Promise) {
				return output.then(logResult);
			}
		}
		return logResult();
	};

	/**
	 * asdf
	 * @template InheritedArgs
	 * @template Args
	 * @overload
	 * @param {string} title
	 * @param {Partial<Type.SuiteOptions<InheritedArgs, Args>>} options
	 * @param {Array<(args: Args) => Promise<Type.SuiteResult | Type.TestResult>>} children
	 * @returns {(inheritedArgs: InheritedArgs) => Promise<Type.SuiteResult>}
	 */
	/**
	 * @template InheritedArgs
	 * @template Args
	 * @overload
	 * @param {string} title
	 * @param {Partial<Omit<Type.SuiteOptions<InheritedArgs, Args>, 'args'>>} options
	 * @param {Array<(args: InheritedArgs) => Promise<Type.SuiteResult | Type.TestResult>>} children
	 * @returns {(inheritedArgs: InheritedArgs) => Promise<Type.SuiteResult>}
	 */
	/**
	 * @template InheritedArgs
	 * @template Args
	 * @param {string} title
	 * @param {Partial<Type.SuiteOptions<InheritedArgs, Args>>} options
	 * @param {Array<(args: Args | InheritedArgs) => Promise<Type.SuiteResult | Type.TestResult>>} children
	 * @returns {(inheritedArgs: InheritedArgs, index: number) => Promise<Type.SuiteResult>}
	 */
	suite(title, options, ...children) {
		return async(inheritedArgs, index) => {
			const args = typeof options?.args === `function`
				? () => isNotNull(options.args)(inheritedArgs)
				: () => ({ ...inheritedArgs });

			const timing = options.timing || `concurrent`;

			const iterationsInput = /** @type {number} */(options.iterations);
			const iterations = nTimes(
				isNaN(iterationsInput) ? 1 : iterationsInput,
				(_nil, index) => () => this.suiteIteration({
					args: /** @type {() => $.PromiseMaybe<Args>} */(args),
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

			return /** @type {Type.SuiteResult} */({
				indexAtDefinition: isNaN(index) ? 0 : index,
				iterations: results,
				timing,
				title,
				type: `suite`,
				...count,
			});
		};
	}

	/**
	 * asdf
	 * @template Args
	 * @param {object} input
	 * @param {() => $.PromiseMaybe<Args>} input.args
	 * @param {Array<(args: Args, index: number) => Promise<Type.SuiteResult | Type.TestResult>>} input.children
	 * @param {number} input.index
	 * @param {Type.SpecStepTiming} input.timing
	 * @returns {Promise<Type.SuiteIterationResult>}
	 */
	async suiteIteration(input) {
		/** @type {Array<Type.SuiteResult | Type.TestResult>} */
		const results = (input.timing === `consecutive`
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

	/**
	 * asdf
	 * @template Args
	 * @param {string} title
	 * @param {typeof Type.TestDefinition<Args>} testDefinition
	 * @param {Partial<Type.TestOptions>} [options]
	 * @returns {typeof Type.Test<Args>}
	 */
	test( // TODO2: Error on suites or tests inside of tests
		title,
		testDefinition,
		options = {},
	) {
		return async(args, index) => {
			const timing = options.timing || `concurrent`;

			const iterationsInput = /** @type {number} */(options.iterations);
			const iterations = nTimes(
				isNaN(iterationsInput) ? 1 : iterationsInput,
				(_nil, index) => () => this.testIteration({
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

			const indexAtDefinition = /** @type {number} */(index);
			return {
				indexAtDefinition: isNaN(indexAtDefinition) ? 0 : indexAtDefinition,
				iterations: results,
				timing,
				title,
				type: `test`,
				...count,
			};
		};
	};

	/**
	 * asdf
	 * @template Args
	 * @param {object} input
	 * @param {Args} input.args
	 * @param {number} input.index
	 * @param {typeof Type.TestDefinition<Args>} input.testDefinition
	 * @returns {Promise<Type.TestIterationResult>}
	 */
	async testIteration(input) {
		/** @type {Type.TestIterationResult} */
		const result = {
			children: [],
			count: { ...specStepCountDefault },
			indexAtDefinition: input.index,
			status: `pass`,
			timeBegin: this.getTime(),
			timeEnd: NaN,
			type: `testIteration`,
		};

		let assertionIndex = 0;

		const setResult = (/** @type {Type.AssertionResult} */assertionResult) => {
			assertionResult.indexAtDefinition = assertionIndex;
			assertionIndex += 1;

			if (SpecStepStatus[assertionResult.status] > SpecStepStatus[result.status]) {
				result.status = assertionResult.status;
			}

			result.count[assertionResult.status] += 1;
			result.count.totalAssertions += 1;

			result.children.push(assertionResult);
		};

		const getAssertionResult = (/** @type {Parameters<typeof this.assert>} */...args) => {
			const assertionResult = this.assert(...args);

			if (assertionResult instanceof Promise) {
				return assertionResult.then(setResult);
			} else {
				return setResult(assertionResult);
			}
		};

		/** @type {typeof Type.SpecLogFactory} */
		const log = message => {
			result.children.push(
				this.log(/** @type {Parameters<typeof this.log>[0]} */(message)),
			);
		};

		await input.testDefinition({
			args: input.args,
			assert: /** @type {typeof Type.AssertionFactory} */(getAssertionResult),
			log,
		});

		result.timeEnd = this.getTime();

		return result;
	}
}
