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

abstract class SpecStep {
	callback: (...arg: Array<unknown>) => $.Type.PromiseMaybe<unknown>;
	index: number;
	options: Partial<SpecStepOptions>;
	parent: SpecStep & {
		children: Array<SpecStep>;
	};
	title: string;

	constructor(input: Pick<
		SpecStep,
		| `callback`
		| `options` // TODO3: Require these to be alphabetized?
		| `parent`
		| `title`
	>) {
		this.callback = input.callback;
		this.index = input.parent
			? input.parent.children.length
			: null;
		this.options = {
			...this.options,
			...input.options,
		};
		this.parent = input.parent;
		this.title = input.title;
	}

	toJSON() {
		return {
			index: this.index,
			options: this.options,
			title: this.title,
		};
	}

	abstract run(input: Pick<SpecStepResult, `parent`>): Promise<SpecStepResult>;
}

interface SpecStepOptions {
	pending: boolean;
}

/**
 * An instance of a SpecStep being run. Note that the SpecStepResult's children are NOT the same as the SpecStep's children: they might be in a different order, and assertions are ephemeral anyway.
 */
abstract class SpecStepResult {
	// TODO1: Timestamps
	description: string;
	index: number;
	owner: SpecStep;
	parent: SpecStepResult & {
		children: Array<SpecStepResult>;
	};
	resultType: ResultType;

	constructor(input: Pick<
		SpecStepResult,
		| `owner`
		| `parent`
	>) {
		this.index = input.parent
			? input.parent.children.length
			: null;
		this.owner = input.owner;
		this.parent = input.parent;
	}

	toJSON() {
		return {
			index: this.index,
			resultType: this.resultType,
			title: this.owner.title,
		};
	}

	toString() {
		return [
			[
				(resultTypeMarks[this.resultType] || resultTypeMarks.pending),
				this.index,
				this.owner.title,
			].join(` `),
			this.description,
		].join(`\n`);
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
		| `parent`
	>) {
		super({
			...input,
			title: input.callback.toString(),
		});
	}

	async run(input: Pick<AssertionResult, `parent`>): Promise<AssertionResult> {
		const result = new AssertionResult({
			owner: this,
			parent: input.parent,
		});
		const didPass = await this.callback(this._helpers);
		const resultType: ResultType = didPass ? `pass` : `fail`;
		result.resultType = resultType;
		return result;
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

class AssertionResult extends SpecStepResult {
	owner: Assertion;
	parent: TestResult;
}

// #endregion

// #region Tests

/**
 * - Children are defined at runtime
 * - Children must be run in the order in which they're defined
 */
class Test extends SpecStep {
	callback: (arg: TestHelpers) => $.Type.PromiseMaybe<void>;
	children: Array<Assertion> = [];

	private _helpers: TestHelpers = {
		assert: this.assert.bind(this),
	};

	constructor(input: Pick<
		Test,
		| `callback`
		| `options`
		| `parent`
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
			parent: this,
		});
		this.children.push(assertion);
		return assertion;
	}

	// TODO1: assertx

	async run(input: Pick<TestResult, `parent`>) {
		this.children = [];
		await this.callback(this._helpers);

		const testResult = new TestResult({
			owner: this,
			parent: input.parent,
		});
		await this.children.reduce(async(previous, child) => {
			await previous;
			const result = await child.run({
				parent: testResult,
			});
			result.parent = testResult;
			testResult.children.push(result);
		}, Promise.resolve());
		return testResult;
	}

	toJSON() {
		return {
			...super.toJSON(),
			children: this.children,
		};
	}

	toString() {
		return [
			super.toString(),
			...this.children.map((child) => child.toString()),
		].join(`\n`);
	}
}

type TestHelpers = Pick<Test, `assert`>;

interface TestOptions extends SpecStepOptions {}

class TestResult extends SpecStepResult {
	children: Array<AssertionResult> = [];

	toJSON() {
		return {
			...super.toJSON(),
			children: this.children,
		};
	}

	toString() {
		return [
			super.toString(),
			...this.children.map((child) => child.toString()),
		].join(`\n`);
	}
}

// #endregion

// #region Suites

/**
 * - Children are defined at compile time
 * - Children can be run in any order
 */
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
			this.callback(this._helpers); // TODO2: Make this async?
		}
	}

	beforeEach(
		callback: () => $.Type.PromiseMaybe<void>
	): void {
		this.beforeEaches.push(callback);
	}

	async run(input: Pick<SuiteResult, `parent`> = {
		parent: null,
	}) {
		const suiteResult = new SuiteResult({
			owner: this,
			parent: input.parent,
		});

		const beforeEach = () => this.beforeEaches.reduce(
			async(previous, beforeEach) => previous.then(beforeEach),
			Promise.resolve()
		);

		await this.children.reduce(async(previous, child) => {
			await previous;
			await beforeEach();
			const result = await child.run({
				parent: suiteResult,
			});
			result.parent = suiteResult;
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
			parent: this,
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
			parent: this,
			title,
		});
		this.children.push(test);
		return test;
	}

	toJSON() {
		return {
			...super.toJSON(),
			children: this.children,
		};
	}

	// TODO1: testx
}

type SuiteHelpers = Pick<Suite, `beforeEach` | `suite` | `test`>;

interface SuiteOptions extends SpecStepOptions {
	// TODO2: Run tests concurrently instead of consecutively? Tricky if beforeEach since might overwrite shraed variables
	shuffle: boolean;
}

class SuiteResult extends SpecStepResult {
	children: Array<TestResult | SuiteResult> = [];

	toJSON() {
		return {
			...super.toJSON(),
			children: this.children,
		};
	}

	toString(): string {
		return [
			super.toString(),
			...this.children.map((child) => child.toString()),
		].join(`\n`);
	}
}

// #endregion
