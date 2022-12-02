import * as $ from 'js/util';

const resultTypes = [ `pending`, `pass`, `error`, `fail`] as const;

type ResultType = typeof resultTypes[number];

// #region SpecStep

interface SpecStepOptions {
	pending: boolean;
}

interface SpecStepResult {
	// TODO1: Timestamps
	// children?: Array<SpecStepResult>;
	// description: string;
	// index: number;
	// prefix: string;
	result: ResultType;
	title: string;

	// constructor(input:
	// 	& Pick<
	// 		SpecStepResult,
	// 		| `description`
	// 		| ``
	// )
}

abstract class SpecStep {
	callback: (...arg: Array<unknown>) => $.Type.PromiseMaybe<unknown>;
	options: Partial<SpecStepOptions>;
	title: string;

	constructor(input: Pick<
		SpecStep,
		| `callback`
		| `options` // TODO3: Require these to be alphabetized?
		| `title`
	>) {
		this.callback = input.callback;
		this.options = {
			...this.options,
			...input.options,
		};
		this.title = input.title;
	}
}

// endregion

// #region Assertions

class Assertion extends SpecStep {  // TODO1: Accept async?
	callback: (arg: AssertionHelpers) => $.Type.PromiseMaybe<boolean>;

	private _helpers: AssertionHelpers = Object.assign(
		this.valueWrap.bind(this),
		{
			thrownBy: this.thrownBy.bind(this),
		}
	);

	constructor(input: Pick<
		Assertion,
		| `callback`
		| `options`
	>) {
		super({
			...input,
			title: input.callback.toString(),
		});
	}

	async run(): Promise<AssertionResult> {
		const didPass = await this.callback(this._helpers);
		const result: ResultType = didPass ? `pass` : `fail`;
		return { result } as AssertionResult;
	}

	thrownBy(
		callback: (...args: unknown[]) => void
	): Error | null {
		try {
			callback();
		} catch (error) {
			return error as Error;
		}
		return null;
	}

	valueWrap<Value>(value: Value) {
		return value;
	}
}

type AssertionHelpers = Assertion[`valueWrap`] & Pick<Assertion, `thrownBy`>;

interface AssertionOptions extends SpecStepOptions {}

interface AssertionResult extends SpecStepResult {}

// #endregion

// #region Tests

class Test extends SpecStep {
	callback: (arg: TestHelpers) => $.Type.PromiseMaybe<void>;
	children: Array<Assertion> = [];
	result: TestResult;

	private _helpers: TestHelpers = {
		assert: this.assert.bind(this),
	};

	constructor(input: Pick<
		Test,
		| `callback`
		| `options`
		| `title`
	>) {
		super(input);
	}

	assert(
		callback: Assertion[`callback`],
		options: Partial<AssertionOptions> = {},
	) {
		const assertion = new Assertion({
			callback,
			options: {
				...this.options || {},
				...options || {},
			},
		});
		this.children.push(assertion);
		return assertion;
	}

	// TODO1: assertx

	async run(): Promise<TestResult> {
		this.result = {
			children: [],
			result: null,
			title: this.title,
		};
		await this.callback(this._helpers);
		return this.result;
	}
}

type TestHelpers = Pick<Test, `assert`>;

interface TestOptions extends SpecStepOptions {}

interface TestResult extends SpecStepResult {
	children: Array<AssertionResult>;
}

// #endregion

// #region Suites

export class Suite extends SpecStep {
	beforeEaches: Array<() => $.Type.PromiseMaybe<void>> = [];
	callback: (arg: SuiteHelpers) => void; // TODO3: Make properties alphabetical
	children: Array<Suite | Test> = [];
	options: Partial<SuiteOptions>;

	private _helpers: SuiteHelpers = { // TODO3: Require private variables to begin with _
		beforeEach: this.beforeEach.bind(this),
		suite: this.suite.bind(this),
		test: this.test.bind(this),
	};

	constructor(input: ConstructorParameters<typeof SpecStep>[0]) {
		super(input);
		if (this.callback) { // Root suite instantiated without a callback
			this.callback(this._helpers);
		}
	}

	beforeEach(
		callback: () => $.Type.PromiseMaybe<void>
	): void {
		this.beforeEaches.push(callback);
	}

	async run(): Promise<SuiteResult> {
		const suiteResult: SuiteResult = {
			children: [],
			result: null,
			title: this.title,
		};

		const beforeEach = () => this.beforeEaches.reduce(
			async(next, beforeEach) => next.then(beforeEach),
			Promise.resolve()
		);

		await this.children.reduce(async(next, child) => {
			await next;
			await beforeEach();
			const result = await child.run();
			suiteResult.children.push(result);
		}, Promise.resolve());

		return suiteResult;
	}

	suite(
		title: string,
		callback: Suite[`callback`],
		options: Partial<SuiteOptions> = {}
	) {
		const suite = new Suite({
			callback,
			options: {
				...this.options || {},
				...options || {},
			},
			title,
		});
		this.children.push(suite);
		return suite;
	}

	// TODO1: suitex

	test(
		title: string,
		callback: Test[`callback`],
		options: Partial<TestOptions> = {}
	) {
		const test = new Test({
			callback,
			options: {
				...this.options || {},
				...options || {},
			},
			title,
		});
		this.children.push(test);
		return test;
	}

	// TODO1: testx
}

type SuiteHelpers = Pick<Suite, `beforeEach` | `suite` | `test`>;

interface SuiteOptions extends SpecStepOptions {
	// TODO2: Run tests concurrently instead of consecutively? Tricky if beforeEach since might overwrite shraed variables
	shuffle: boolean;
}

interface SuiteResult extends SpecStepResult {
	children: Array<TestResult | SuiteResult>;
}

// #endregion
