import * as $ from 'js/util';

const resultTypes = [ `pending`, `pass`, `error`, `fail`] as const;

const resultTypeMarks: Record<ResultType, string> = {
	'error': `🟡`,
	'fail': `🔴`,
	'pass': `🟢`,
	'pending': `⚪`,
};

type ResultType = typeof resultTypes[number];

// #region SpecStep

abstract class SpecStep<
	Result extends SpecStepResult = SpecStepResult,
	Options extends SpecStepOptions = SpecStepOptions
> {
	abstract TypeResult: $.Type.Constructor<Result>;

	constructor(
		public callback:
			(...args: Array<unknown>) => $.Type.PromiseMaybe<unknown>,
		public options: Options,
	) {
		this.options = {
			...this.optionsDefaults(),
			...(options || {}),
		};
	}

	optionsDefaults(): Options {
		return {
			pending: false,
		} as Options;
	}

	run(options: Partial<Options> = {}) {
		return new this.TypeResult();
	}
}

type SpecStepOptions = {
	pending: boolean;
};

abstract class SpecStepResult {
	resultType: ResultType;
}

// #endregion

// #region AssertionHelpers
export const assertionHelpers = Object.assign(
	valueWrap,
	{
		thrownBy,
	}
);

function thrownBy(callback: () => unknown): Error | null {
	try {
		callback();
	} catch (error) {
		return error as Error;
	}
	return null;
}

function valueWrap<Value>(value: Value) {
	return value;
}
// #endregion

// #region Assertion

export class Assertion extends SpecStep<
	AssertionResult,
	AssertionOptions
> {
	TypeResult = AssertionResult;

	constructor(
		public callback:
			(helpers: AssertionHelpers) => $.Type.PromiseMaybe<boolean>,
		public options: AssertionOptions,
	) {
		super(callback, options);
	}

	helpers(): AssertionHelpers {
		return assertionHelpers;
	}
}

export type AssertionHelpers = typeof assertionHelpers;

export type AssertionOptions = SpecStepOptions;

export class AssertionResult extends SpecStepResult {
	values: Array<unknown>;
}

// #endregion

// #region Test

export class Test extends SpecStep<
	TestResult,
	TestOptions
> {
	TypeResult = TestResult;

	constructor(
		public title: string,
		public callback: () => $.Type.PromiseMaybe<void>,
		public options: TestOptions,
	) {
		super(callback, options);
	}

	assert(
		...args: ConstructorParameters<typeof Assertion>
	) {
		const assertion = new Assertion(...args);
		return assertion;
	}
}

export type TestOptions = SpecStepOptions;

export class TestResult extends SpecStepResult {
	children: Array<AssertionResult>;
}

// #endregion

// #region Suite

export class Suite extends SpecStep<
	SuiteResult,
	SuiteOptions
> {
	beforeEaches: Array<() => $.Type.PromiseMaybe<void>> = [];
	TypeResult = SuiteResult;

	constructor(
		public title: string,
		public callback: () => $.Type.PromiseMaybe<void>,
		public options: SuiteOptions,
	) {
		super(callback, options);
	}

	beforeEach(
		callback: Suite[`beforeEaches`][0]
	): void {
		this.beforeEaches.push(callback);
	}

	suite(
		...args: ConstructorParameters<typeof Suite>
	) {
		const suite = new Suite(...args);
		return suite;
	}

	test(
		...args: ConstructorParameters<typeof Test>
	) {
		const test = new Test(...args);
		return test;
	}
}

export type SuiteOptions = SpecStepOptions;

export class SuiteResult extends SpecStepResult {
	children: Array<TestResult | SuiteResult>;
}

// #endregion
