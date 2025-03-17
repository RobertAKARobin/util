import type * as $ from '../../types.d';

import type { specStepStatuses, specStepTiming, specStepTypes } from './builder';

//#region SpecStep
export type SpecLog = SpecResult & {
	message: string;
	time: number;
	type: Extract<SpecStepTypeName, `log`>;
};

export function SpecLogFactory<Message = string>(message: () => Promise<Message>): Promise<Message>;
export function SpecLogFactory<Message = string>(message: () => Message): Message;
export function SpecLogFactory<Message = string>(message: Message): Message;

export type SpecRenderOptions = {
	/**
	 * Controls how the different specs should be stringified. By default just returns the `defaultText`
	 * @param input - The spec to be stringified
	 * @param defaultText - The default stringification provided by SpecRenderer
	 */
	format: (
		input:
			| AssertionResult
			| SpecLog
			| SuiteIterationResult
			| SuiteResult
			| TestIterationResult
			| TestResult,
		defaultText: $.Nested<string>,
	) => $.Nested<string>;
	/**
	 * Whether to include time calculations in the string output
	 */
	showTiming: boolean;
};

export type SpecResult = {
	type: SpecStepTypeName;
};

export type SpecRunner<Args = {}> = (
	specFilenames: Array<string>,
	options?: SuiteOptions<{}, Args>
) => Promise<SuiteResult>;

export type SpecStepCount = Record<
	|	SpecStepStatusName
	| `totalAssertions`,
	number
>;

export type SpecStepIterationResult<Child extends SpecResult> = SpecStepResult & {
	children: Array<Child>;
};

export type SpecStepResultCount = {
	count: SpecStepCount;
	status: SpecStepStatusName;
	timeBegin: number;
	timeEnd: number;
};

export type SpecStepResult = SpecResult & SpecStepResultCount & {
	/**
	 * The index of this step among its siblings when it was defined in the code, which may be different from the index among its siblings when it is actually run, since siblings may be shuffled, async, etc.
	 */
	indexAtDefinition: number;
};

export type SpecStepStatusName = typeof specStepStatuses[number];

export type SpecStepTiming = typeof specStepTiming[number];

export type SpecStepTypeName = typeof specStepTypes[number];
//#endregion

//#region Assertion
export function Assertion(valueWrap: typeof AssertionValueWrap): Promise<boolean> | boolean;

export function AssertionFactory(
	assertion: (valueWrap: typeof AssertionValueWrap) => boolean
): void;
export function AssertionFactory(
	assertion: (valueWrap: typeof AssertionValueWrap) => Promise<boolean>
): Promise<void>;

export function AssertionValueWrap <Value>(value: Value): Value;

export type AssertionResult = Omit<SpecStepResult, `count`> & {
	/**
	 * The assertion function, stringified via `.toString()`
	 */
	contents: string;
	type: Extract<SpecStepTypeName, `assertion`>;
	/**
	 * The values captured by the assertion's valueWrap callback
	 */
	values: Array<string>;
};
//#endregion

//#region Suite
export type SuiteIterationOptions<
	InheritedArgs,
	Args,
> = Omit<SuiteOptions<InheritedArgs, Args>, `iterations`>;

export type SuiteIterationResult = SpecStepIterationResult<SuiteResult | TestResult> & {
	type: Extract<SpecStepTypeName, `suiteIteration`>;
};

export type SuiteOptions<
	InheritedArgs,
	Args,
> = {
	/**
	 * Returns arguments passed to each of the suite's children
	 * @param inheritedArgs - Args passed into this suite from its parent suite
	 */
	args?: (inheritedArgs: InheritedArgs) => $.PromiseMaybe<Args>;
	/**
	 * How many times this suite should be run
	 */
	iterations?: number;
	/**
	 * Whether this suite's iterations and children should be run consecutively or concrrently
	 */
	timing?: SpecStepTiming;
};

export type SuiteResult = SpecStepResult & {
	iterations: Array<SuiteIterationResult>;
	timing: SpecStepTiming;
	title: string;
	type: Extract<SpecStepTypeName, `suite`>;
};
//#endregion

//#region Test
export function Test<Args>(
	args: Args,
	index?: number,
): Promise<TestResult>;

/**
 * A test is a function in which assertions are made.
 */
export function TestDefinition<Args>(input: {
	/**
	 * Args passed into this test from its parent suite
	 */
	args: Args;
	/**
	 * Returns whether the given assertion passed.
	 * An assertion is a callback that returns a boolean. The callback is passed a little utility function that, when passed a value, helps display that value in the unit tests' output, which is great for debugging.
	 */
	assert: typeof AssertionFactory;
	/**
	 * See {@link SpecLogFactory}
	 */
	log: typeof SpecLogFactory;
}): Promise<void> | void;

export type TestIterationResult = SpecStepIterationResult<AssertionResult | SpecLog> & {
	type: Extract<SpecStepTypeName, `testIteration`>;
};

export type TestOptions = {
	/**
	 * How many times this test should be run
	 */
	iterations: number;
	/**
	 * Whether this test's iterations should be run consecutively or concurrently
	 */
	timing: SpecStepTiming;
};

export type TestResult = SpecStepResult & {
	iterations: Array<TestIterationResult>;
	timing: SpecStepTiming;
	title: string;
	type: Extract<SpecStepTypeName, `test`>;
};
//#endregion
