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

	abstract run(options?: Partial<Options>): Promise<Result>;
}

type SpecStepOptions = {
	pending: boolean;
};

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

export class Assertion extends SpecStep<
	AssertionResult,
	AssertionOptions
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

export class Test extends SpecStep<
	TestResult,
	TestOptions
> {
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
			iterations: 1,
			pending: false,
		};
	}

	async run(options: Partial<TestOptions> = {}): Promise<TestResult> {
		await this.callback(this.helpers());
		return {} as TestResult;
	}

	private async assert(...args: ConstructorParameters<typeof Assertion>) {
		const assertion = new Assertion(...args);
		return await assertion.run();
	}
}

export type TestOptions = SpecStepOptions & {
	iterations: number;
};

export type TestResult = SpecStepResult & {
	children: Array<AssertionResult>;
};

// #endregion

// #region Suite

export class Suite extends SpecStep<
	SuiteResult,
	SuiteOptions
> {
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
		return {
			beforeEach: null as Suite[`beforeEach`],
			suite: this.suite.bind(this),
			test: this.test.bind(this),
		};
	}

	optionsDefaults() {
		return {
			iterations: 1,
			pending: false,
		};
	}

	async run(options: Partial<SuiteOptions> = {}) {
		const suiteResult = {} as SuiteResult;

		await this.children.reduce(async(previous, child) => {
			await previous;
			await this.beforeEach();
			const result = await child.run();
			// testResult.children.push(result);
		}, Promise.resolve());

		return suiteResult;
	}

	suite(...args: ConstructorParameters<typeof Suite>) {
		// Pass `before` as option
		return this.addChild(Suite, ...args) as Suite;
	}

	test(...args: ConstructorParameters<typeof Test>) {
		return this.addChild(Test, ...args) as Test;
	}
}

export type SuiteOptions = SpecStepOptions & {
	iterations: number;
};

export interface SuiteResult extends SpecStepResult { // Can't use `type` because this circularly references itself
	children: Array<TestResult | SuiteResult>;
}

// #endregion
