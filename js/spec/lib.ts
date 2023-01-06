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
	Result extends SpecStepResult = SpecStepResult
> {
	constructor(
		public callback:
			(...args: Array<unknown>) => $.Type.PromiseMaybe<unknown>,
		public options?: Partial<SpecStepOptions>,
	) {
		this.options = {
			...this.optionsDefaults(),
			...(options || {}),
		};
	}

	optionsDefaults() {
		return {
			pending: false as boolean,
		};
	}

	abstract run(runtimeOptions?: Partial<SpecStepOptions>): Promise<Result>;
}

type SpecStepOptions = ReturnType<SpecStep[`optionsDefaults`]>;

type SpecStepResult = {
	resultType: ResultType;
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

export class Assertion extends SpecStep<AssertionResult> {
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

export type AssertionOptions = ReturnType<Assertion[`optionsDefaults`]>;

export type AssertionResult = SpecStepResult & {
	values: Array<unknown>;
};

// #endregion

// #region Test

export class Test extends SpecStep<TestResult> {
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

	optionsDefaults() {
		return {
			after: null as () => $.Type.PromiseMaybe<void>,
			before: null as () => $.Type.PromiseMaybe<void>,
			iterations: 1 as number,
			pending: false as boolean,
		};
	}

	async run(runtimeOptions: Partial<TestOptions> = {}): Promise<TestResult> {
		const options = {
			...this.options,
			...runtimeOptions,
		};

		if (options.before) {
			await options.before();
		}
		await this.callback(this.helpers());
		if (options.after) {
			await options.after();
		}
		return {} as TestResult;
	}

	private async assert(...args: ConstructorParameters<typeof Assertion>) {
		const assertion = new Assertion(...args);
		return await assertion.run();
	}
}

export type TestOptions = ReturnType<Test[`optionsDefaults`]>;

export type TestResult = SpecStepResult & {
	children: Array<AssertionResult>;
};

// #endregion

// #region Suite

export class Suite extends SpecStep<SuiteResult> {
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
			after: null as () => $.Type.PromiseMaybe<void>,
			before: null as () => $.Type.PromiseMaybe<void>,
			iterations: 1 as number,
			pending: false as boolean,
		};
	}

	async run(runtimeOptions: Partial<SuiteOptions> = {}) {
		const options = {
			...this.options,
			...runtimeOptions,
		};

		const suiteResult = {} as SuiteResult;

		if (options.before) {
			await options.before();
		}
		if (this.beforeAll) {
			await this.beforeAll();
		}

		await this.children.reduce(async(previous, child) => {
			await previous;
			const result = await child.run({
				after: this.afterEach,
				before: this.beforeEach,
			});
			// testResult.children.push(result);
		}, Promise.resolve());

		if (this.afterAll) {
			await this.afterAll();
		}
		if (options.after) {
			await options.after();
		}

		return suiteResult;
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

export type SuiteOptions = ReturnType<Suite[`optionsDefaults`]>;

export interface SuiteResult extends SpecStepResult { // Can't use `type` because this circularly references itself
	children: Array<TestResult | SuiteResult>;
}

// #endregion
