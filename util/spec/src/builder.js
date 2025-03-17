/**
 * @import * as $ from '../../types.d';
 * @import * as Type from './types.d';
 */

import { arrayToEnum } from '../../group/arrayToEnum.js';
import { isNotNull } from '../../isNotNull.js';
import { nTimes } from '../../group/nTimes.js';
import { promiseConsecutive } from '../../time/promiseConsecutive.js';

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

/**
 * A utility to write unit tests, organized into suites, tests, and assertions, which bundles the results into a tidy JSON structure.
 */
export class SpecBuilder {
	constructor() {
		this.count = this.count.bind(this);
		this.log = this.log.bind(this); // Typescript doesn't yet support overloads for arrow functions https://github.com/microsoft/TypeScript/issues/47669
		this.suite = this.suite.bind(this);
		this.test = this.test.bind(this);
	}

	/**
	 * Makes an assertion within a test. See {@link Type.TestDefinition}
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
	 * How this SpecBuilder tallies up the results of its tests.
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
	 * How this SpecBuilder gets the current time.
	 * @returns {number}
	 */
	getTime() {
		return performance.now();
	}

	/**
	 * Formats the given message to be included in the unit test output.
	 * @param {unknown} message
	 * @returns {Type.SpecLog}
	 */
	log(message) {
		return {
			message: `${message}`,
			time: this.getTime(),
			type: `log`,
		};
	};

	/**
	 * Defines a collection of child tests and suites, including any args that will be passed to its children.
	 * @template InheritedArgs
	 * @template Args
	 * @param {string} title
	 * @param {Type.SuiteOptions<InheritedArgs, Args>} options
	 * @param {...(args: Args) => Promise<Type.SuiteResult | Type.TestResult>} children
	 * @returns {(inheritedArgs: InheritedArgs, index?: number) => Promise<Type.SuiteResult>}
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
				indexAtDefinition: isNaN(/** @type {number} */(index)) ? 0 : index,
				iterations: results,
				timing,
				title,
				type: `suite`,
				...count,
			});
		};
	}

	/**
	 * Runs the given suites/tests one time.
	 * @template Args
	 * @param {object} input
	 * @param {() => $.PromiseMaybe<Args>} input.args
	 * @param {Array<(args: Args, index: number) => Promise<Type.SuiteResult | Type.TestResult>>} input.children
	 * @param {number} input.index
	 * @param {Type.SpecStepTiming} input.timing
	 * @returns {Promise<Type.SuiteIterationResult>}
	 * @private
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
	 * Defines a test. See {@link Type.TestDefinition}
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
	 * Runs the given test one time.
	 * @template Args
	 * @param {object} input
	 * @param {Args} input.args
	 * @param {number} input.index
	 * @param {typeof Type.TestDefinition<Args>} input.testDefinition
	 * @returns {Promise<Type.TestIterationResult>}
	 * @private
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

		/**
		 * @template Value
		 * @param {Value} message
		 * @returns {Value}
		 */
		const appendLog = message => {
			const logOutput = this.log(message);
			result.children.push(logOutput);
			return message;
		};

		/** @type {Type.SpecLogFactory} */
		const log = message => {
			const value = message instanceof Function ? message() : message;

			if (value instanceof Promise) {
				return value.then(appendLog);
			}

			appendLog(value);
			return value;
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
