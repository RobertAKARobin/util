import * as $ from 'js/util';

async function chainAsync( // TODO1: Move to js/util
	steps: Array<(
		next: () => $.Type.PromiseMaybe<void>
	) => $.Type.PromiseMaybe<void>>
): Promise<void> {
	// TODO3: Add return values
	let indexCurrent = -1;
	await next();

	async function next() {
		indexCurrent += 1;
		const step = steps[indexCurrent];
		if (step) {
			await step(next);
		}
	}
}

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

function valueWrap<Value>(value: Value) {
	return value;
}

function thrownBy(
	callback: (...args: unknown[]) => void
): Error | null {
	try {
		callback();
	} catch (error) {
		return error as Error;
	}
	return null;
}

const assertionHelpers = Object.assign(valueWrap, {
	thrownBy,
});

// interface AssertionOptions extends SpecStepOptions {}

interface AssertionResult extends SpecStepResult {}

type Assertion = (arg: typeof assertionHelpers) => boolean;

// #endregion

// #region Tests

interface TestOptions extends SpecStepOptions {}

interface TestResult extends SpecStepResult {
	children: Array<AssertionResult>;
}

type TestHelpers = Pick<Test, `assert`>;

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
		assertion: Assertion, // TODO1: Accept primitives as well as functions
		// options: Partial<AssertionOptions> = {}
	) {
		const didPass = assertion(assertionHelpers);
		const result: ResultType = didPass ? `pass` : `fail`;
		this.result.children.push({
			result,
			title: assertion.toString(),
		});
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

// #endregion

// #region Suites

interface SuiteOptions extends SpecStepOptions {
	shuffle: boolean;
}

interface SuiteResult extends SpecStepResult {
	children: Array<TestResult | SuiteResult>;
}

type SuiteHelpers = Pick<Suite, `beforeEach` | `suite` | `test`>;

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
		const beforeEach = () => chainAsync(
			this.beforeEaches.map((callback) => {
				return async(next: () => Promise<void>) => {
					await callback();
					await next();
				};
			}),
		);
		await chainAsync(
			this.children.map((child) => {
				return async(next: () => Promise<void>) => {
					await beforeEach();
					const result = await child.run();
					suiteResult.children.push(result);
					await next();
				};
			})
		);
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

// #endregion
