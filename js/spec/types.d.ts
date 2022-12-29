import * as $ from 'js/util/types';

export type ResultTypesOrder = [ `pending`, `pass`, `error`, `fail`];

export type ResultType = ResultTypesOrder[number];

// #region SpecStep

export interface SpecStep<
	Options extends SpecStepOptions = SpecStepOptions,
> {
	options: Partial<Options>;
}

export interface SpecStepOptions {
	pending: boolean;
}

/**
 * An instance of a SpecStep being run. Note that the SpecStepResult's children are NOT the same as the SpecStep's children: they might be in a different order, and assertions are ephemeral anyway.
 */
export interface SpecStepResult {
	resultType: ResultType;
}

export interface SpecStepResultParent<
	Child extends SpecStepResult
> extends SpecStepResult {
	readonly children: Array<Child>;
}

// #endregion

// #region Assertion

export interface Assertion extends SpecStep<AssertionOptions> {
	callback: (helpers: AssertionHelpers) => $.PromiseMaybe<boolean>;
}

export type AssertionHelpers =
	& (<Value>(value: Value) => Value)
	& {
		thrownBy: ((callback: () => unknown) => Error | null);
	};

export interface AssertionOptions extends SpecStepOptions {}

export interface AssertionResult extends SpecStepResult {
	values: Array<unknown>;
}

// #endregion

// #region Test

export interface Test extends SpecStep<TestOptions> {
	callback: (helpers: TestHelpers) => $.PromiseMaybe<void>;
	title: string;
}

export type TestHelpers = {
	assert: (
		callback: Assertion[`callback`],
		options?: Partial<AssertionOptions>
	) => Promise<void>;
};

export interface TestOptions extends SpecStepOptions {}

export interface TestResult extends SpecStepResultParent<AssertionResult> {}

// #endregion

// #region Suite

export interface Suite extends SpecStep<SuiteOptions> {
	beforeEaches: Array<Parameters<SuiteHelpers[`beforeEach`]>[0]>;
	callback: (helpers: SuiteHelpers) => void;
	children: Array<Suite | Test>;
	title: string;
}

export type SuiteHelpers = {
	beforeEach: (
		callback: () => $.PromiseMaybe<void>
	) => void;

	suite: (
		title: string,
		callback: Suite[`callback`],
		options?: Partial<SuiteOptions>
	) => void;

	test: (
		title: string,
		callback: Test[`callback`],
		options?: Partial<TestOptions>
	) => void;
};

export interface SuiteOptions extends SpecStepOptions {
	// TODO2: Run tests concurrently instead of consecutively? Tricky if beforeEach since might overwrite shraed variables
	shuffle: boolean;
}

export interface SuiteResult extends SpecStepResultParent<
	SuiteResult | TestResult
> {}

// #endregion
