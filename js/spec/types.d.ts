import * as $ from 'js/util/types';

export type ResultTypesOrder = [ `pending`, `pass`, `error`, `fail`];

export type ResultType = ResultTypesOrder[number];

// #region SpecStep

export interface SpecStep<
	Options extends SpecStepOptions = SpecStepOptions,
> {
	callback: (...arg: Array<unknown>) => $.PromiseMaybe<unknown>;
	index: number;
	options: Partial<Options>;
	parent: SpecStepParent<this>;
	title: string;
}

export interface SpecStepOptions {
	pending: boolean;
}

export interface SpecStepParent<
	Child extends SpecStep,
	Options extends SpecStepOptions = SpecStepOptions
> extends SpecStep<Options> {
	readonly children: Array<Child>;
}

/**
 * An instance of a SpecStep being run. Note that the SpecStepResult's children are NOT the same as the SpecStep's children: they might be in a different order, and assertions are ephemeral anyway.
 */
export interface SpecStepResult<
	Owner extends SpecStep = SpecStep
> {
	description: string;
	index: number;
	indexPath: Array<number>;
	owner: Owner;
	parent: SpecStepResultParent<this>;
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

export interface AssertionResult extends SpecStepResult<Assertion> {
	values: Array<unknown>;
}

// #endregion

// #region Test

export interface Test extends SpecStepParent<Assertion, TestOptions> {
	callback: (helpers: TestHelpers) => $.PromiseMaybe<void>;
}

export type TestHelpers = {
	assert: (
		callback: Assertion[`callback`],
		options?: Partial<AssertionOptions>
	) => void;
};

export interface TestOptions extends SpecStepOptions {}

export interface TestResult extends SpecStepResultParent<AssertionResult> {}

// #endregion

// #region Suite

export interface Suite extends SpecStepParent<
	Suite | Test,
	SuiteOptions
> {
	beforeEaches: Array<Parameters<SuiteHelpers[`beforeEach`]>[0]>;
	callback: (helpers: SuiteHelpers) => $.PromiseMaybe<void>;
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
