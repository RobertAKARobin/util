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

	abstract run(options?: Partial<Options>): Promise<Result>;
}

type SpecStepOptions = {
	pending: boolean;
};

abstract class SpecStepParent<
	Result extends SpecStepResult = SpecStepResult,
	Options extends SpecStepOptions = SpecStepOptions,
	Child extends SpecStep = SpecStep,
> extends SpecStep<Result, Options> {
	beforeEaches: Array<() => $.Type.PromiseMaybe<void>> = [];
	children: Array<Child> = [];

	addChild<Constructor extends $.Type.Constructor<Child>>(
		Constructor: Constructor,
		...args: ConstructorParameters<Constructor>
	) {
		const child = new Constructor(...args);
		this.children.push(child);
		return child;
	}

	beforeEach(
		callback: SpecStepParent[`beforeEaches`][0]
	): void {
		this.beforeEaches.push(callback);
	}

	async run(options: Partial<Options> = {}) {
		const testResult = new this.TypeResult();

		const beforeEach = () => this.beforeEaches.reduce(
			async(previous, beforeEach) => previous.then(beforeEach),
			Promise.resolve()
		);

		await this.children.reduce(async(previous, child) => {
			await previous;
			await beforeEach();
			const result = await child.run();
			// testResult.children.push(result);
		}, Promise.resolve());

		return testResult;
	}
}

abstract class SpecStepResult {
	resultType: ResultType;
}

abstract class SpecStepResultParent<Child extends SpecStepResult> {
	children: Array<Child> = [];
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

	async run() {
		const didPass = await this.callback(this.helpers());
		return {} as AssertionResult;
	}
}

export type AssertionHelpers = typeof assertionHelpers;

export type AssertionOptions = SpecStepOptions;

export class AssertionResult extends SpecStepResult {
	values: Array<unknown>;
}

// #endregion

// #region Test

export class Test extends SpecStepParent<
	TestResult,
	TestOptions,
	Assertion
> {
	TypeResult = TestResult;

	constructor(
		public title: string,
		public callback: () => $.Type.PromiseMaybe<void>,
		public options: TestOptions,
	) {
		super(callback, options);
	}

	assert(...args: ConstructorParameters<typeof Assertion>) {
		return this.addChild(Assertion, ...args);
	}
}

export type TestOptions = SpecStepOptions;

export class TestResult extends SpecStepResult {
	children: Array<AssertionResult>;
}

// #endregion

// #region Suite

export class Suite extends SpecStepParent<
	SuiteResult,
	SuiteOptions,
	Suite | Test
> {
	TypeResult = SuiteResult;

	constructor(
		public title: string,
		public callback: () => $.Type.PromiseMaybe<void>,
		public options: SuiteOptions,
	) {
		super(callback, options);
	}

	suite(...args: ConstructorParameters<typeof Suite>) {
		return this.addChild(Suite, ...args) as Suite;
	}

	test(...args: ConstructorParameters<typeof Test>) {
		return this.addChild(Test, ...args) as Test;
	}
}

export type SuiteOptions = SpecStepOptions;

export class SuiteResult extends SpecStepResult {
	children: Array<TestResult | SuiteResult>;
}

// #endregion
