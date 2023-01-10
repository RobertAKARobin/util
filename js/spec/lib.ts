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
	Options extends SpecStepOptions = SpecStepOptions,
	Result = Record<string, unknown>
> {
	constructor(
		public callback:
			(...args: Array<unknown>) => $.Type.PromiseMaybe<unknown>,
		public options?: Partial<Options>,
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

	abstract run(runtimeOptions?: Partial<Options>): Promise<Result>;
}

type SpecStepOptions = {
	pending: boolean;
};

type SpecStepResult = {
	resultType: ResultType;
};

abstract class SpecStepIterable<
	Options extends SpecStepIterableOptions = SpecStepIterableOptions,
	Result extends SpecStepIterableResult = SpecStepIterableResult,
> extends SpecStep<Options, Result> {

	optionsDefaults() {
		return {
			...super.optionsDefaults(),
			iterations: 1 as number,
		};
	}

	async run(...[runtimeOptions]: Parameters<SpecStepIterable[`runOnce`]>) {
		const options = {
			...this.options,
			...runtimeOptions,
		};

		const iterableResult = {
			iterations: [],
		} as Result;

		const iterations = Array.from(Array(options.iterations));
		await iterations.reduce(async(previous) => {
			await previous;
			const iterationResult = await this.runOnce(options);
			iterableResult.iterations.push(iterationResult);
		}, Promise.resolve());

		return iterableResult;
	}

	abstract runOnce(runtimeOptions?: Partial<Options>): Promise<
		Result[`iterations`][0]
	>;
}

type SpecStepIterableOptions = SpecStepOptions & {
	iterations: number;
};

type SpecStepIterableResult<
	IterationResult extends SpecStepResult = SpecStepResult
> = {
	iterations: Array<IterationResult>;
};

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
	AssertionOptions,
	AssertionResult
> {
	constructor(
		public callback: (
			helpers: ReturnType<Assertion[`helpers`]>
		) => $.Type.PromiseMaybe<boolean>,
		public options?: Partial<AssertionOptions>,
	) {
		super(callback, options);
	}

	helpers() {
		return assertionHelpers;
	}

	async run(options: Partial<AssertionOptions> = {}): Promise<AssertionResult> {
		const didPass = await this.callback(this.helpers());
		const resultType: ResultType = didPass ? `pass` : `fail`;
		return {
			resultType,
			values: [],
		};
	}
}

export type AssertionOptions = SpecStepOptions;

export type AssertionResult = SpecStepResult & {
	values: Array<unknown>;
};

// #endregion

// #region Test

export class Test extends SpecStepIterable<TestOptions, TestResult> {
	constructor(
		public title: string,
		public callback: (
			helpers: ReturnType<Test[`helpers`]>
		) => $.Type.PromiseMaybe<void>,
		public options?: Partial<TestOptions>,
	) {
		super(callback, options);
	}

	helpers() {
		return {
			assert: this.assert.bind(this),
		};
	}

	optionsDefaults(): TestOptions {
		return {
			...super.optionsDefaults(),
			after: null,
			before: null,
		};
	}

	async run(...[runtimeOptions]: Parameters<Test[`runOnce`]>) {
		return {
			...await super.run(runtimeOptions),
			title: this.title,
		};
	}

	async runOnce(runtimeOptions: Partial<TestOptions> = {}) {
		const options = {
			...this.options,
			...runtimeOptions,
		};

		const testIterationResult: TestIterationResult = {
			children: [],
			resultType: null,
			timeEnd: null,
			timeStart: performance.now(),
		};

		if (options.before) {
			await options.before();
		}
		await this.callback(this.helpers());
		if (options.after) {
			await options.after();
		}

		testIterationResult.timeEnd = performance.now();
		return testIterationResult;
	}

	private async assert(...args: ConstructorParameters<typeof Assertion>) {
		const assertion = new Assertion(...args);
		return await assertion.run();
	}
}

export type TestOptions = SpecStepIterableOptions & {
	after: () => $.Type.PromiseMaybe<void>;
	before: () => $.Type.PromiseMaybe<void>;
};

export type TestResult = SpecStepIterableResult<TestIterationResult>;

export type TestIterationResult = SpecStepResult & {
	children: Array<AssertionResult>;
	timeEnd: number;
	timeStart: number;
};

// #endregion

// #region Suite

export class Suite extends SpecStepIterable<SuiteOptions, SuiteResult> {
	afterAll: () => $.Type.PromiseMaybe<void>;
	afterEach: () => $.Type.PromiseMaybe<void>;
	beforeAll: () => $.Type.PromiseMaybe<void>;
	beforeEach: () => $.Type.PromiseMaybe<void>;
	children: Array<Suite | Test> = [];

	constructor(
		public title: string,
		public callback: (helpers: ReturnType<Suite[`helpers`]>) => void,
		public options?: Partial<SuiteOptions>,
	) {
		super(callback, options);
		if (this.callback) {
			this.callback(this.helpers());
		}
	}

	addChild<Constructor extends $.Type.Constructor<Suite | Test>>(
		Constructor: Constructor,
		...args: ConstructorParameters<Constructor>
	) {
		const child = new Constructor(...args);
		this.children.push(child);
		return child;
	}

	helpers() {
		const helpers: Pick<SuiteHelpers, `suite` | `test`> = {
			suite: this.suite.bind(this),
			test: this.test.bind(this),
		};
		return Object.defineProperties(helpers, {
			afterAll: $.defineSetter(this, `afterAll`),
			afterEach: $.defineSetter(this, `afterEach`),
			beforeAll: $.defineSetter(this, `beforeAll`),
			beforeEach: $.defineSetter(this, `beforeEach`),
		}) as SuiteHelpers;
	}

	optionsDefaults() {
		return {
			...super.optionsDefaults(),
			after: null,
			before: null,
		};
	}

	async run(...[runtimeOptions]: Parameters<Suite[`runOnce`]>) {
		return {
			...await super.run(runtimeOptions),
			title: this.title,
		};
	}

	async runOnce(runtimeOptions: Partial<SuiteOptions> = {}) {
		const options = {
			...this.options,
			...runtimeOptions,
		};

		const suiteIterationResult: SuiteIterationResult = {
			children: [],
			resultType: null,
			timeEnd: null,
			timeStart: performance.now(),
		};

		if (options.before) {
			await options.before();
		}
		if (this.beforeAll) {
			await this.beforeAll();
		}

		// TODO2: Don't define a function in a loop
		await this.children.reduce(async(previous, child) => {
			await previous;
			const result = await child.run({
				after: child.options && `after` in child.options
					? child.options.after
					: this.afterEach,
				before: child.options && `before` in child.options
					? child.options.before
					: this.beforeEach,
			});
			suiteIterationResult.children.push(result);
		}, Promise.resolve());

		if (this.afterAll) {
			await this.afterAll();
		}
		if (options.after) {
			await options.after();
		}

		suiteIterationResult.timeEnd = performance.now();

		return suiteIterationResult;
	}

	suite(...args: ConstructorParameters<typeof Suite>) {
		return this.addChild(Suite, ...args) as Suite;
	}

	test(...args: ConstructorParameters<typeof Test>) {
		return this.addChild(Test, ...args) as Test;
	}
}

export type SuiteHelpers = {
	afterAll: Suite[`afterAll`];
	afterEach: Suite[`afterEach`];
	beforeAll: Suite[`beforeAll`];
	beforeEach: Suite[`beforeEach`];
	readonly suite: Suite[`suite`];
	readonly test: Suite[`test`];
};

export type SuiteOptions = SpecStepIterableOptions & {
	after: () => $.Type.PromiseMaybe<void>;
	before: () => $.Type.PromiseMaybe<void>;
};

export type SuiteResult = SpecStepIterableResult<SuiteIterationResult> & {
	title: string;
};

export type SuiteIterationResult = SpecStepResult & {
	children: Array<TestResult | SuiteResult>;
	timeEnd: number;
	timeStart: number;
};

// #endregion
