/* eslint-disable */

const resultTypes = [`error`, `fail`, `pass`, `skip`] as const;

// #region SpecLogItem

abstract class SpecStep {
	children?: Array<SpecStep>;
	indexInCode: number;
	indexInExecution: number;
	parent: SpecStep;
	prefix: string;

	constructor(
		input: Pick<
			SpecStep,
			| `parent`
		>
	) {
		this.parent = input.parent;
		this.indexInCode = (this.parent?.children?.length || 0) + 1;
		this.prefix = (
			this.parent
			?	(this.parent?.prefix || ``) + `${this.indexInCode}.`
			: ``
		);
	}

	toJSON() { // TODO1: Don't use toJSON, probably
		return {
			prefix: this.prefix,
		};
	}
}

// endregion

// #region Assertions

function valueWrap<Value>(value: Value) {
	console.log(value);
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

const assertionOptionsDefaults = {
	dry: true as boolean,
} as const;

type AssertionOptions = Partial<typeof assertionOptionsDefaults>;

class Assertion extends SpecStep {
	callback: (arg: typeof assertionHelpers) => boolean;
	options: AssertionOptions;
	result: typeof resultTypes[number];

	constructor(
		input:
			& ConstructorParameters<typeof SpecStep>[0]
			& Pick<Assertion, `callback` | `options`>
	) {
		super(input);
		this.callback = input.callback;
		this.options = {
			...assertionOptionsDefaults,
			...input.options,
		};
	}

	toJSON() {
		return {
			...super.toJSON(),
			textHeader: this.callback.toString(),
		};
	}
}

// #endregion

// #region Suites

const suiteOptionsDefaults = {
	dry: true as boolean,
	shuffle: false as boolean,
} as const;

type SuiteOptions = Partial<typeof suiteOptionsDefaults>;

type SuiteLog = Array<string | SuiteLog>;

class Suite extends SpecStep {
	callback: (arg: SpecRunner) => void; // TODO2: Make properties alphabetical
	children: Array<Suite | Assertion> = [];
	message: string;
	options: SuiteOptions = suiteOptionsDefaults;
	result: typeof resultTypes[number];

	constructor(
		input:
			& ConstructorParameters<typeof SpecStep>[0]
			& Pick<Suite, `callback` | `message` | `options`>
	) {
		super(input);
		this.callback = input.callback;
		this.message = input.message;
		this.options = {
			...suiteOptionsDefaults,
			...input.options,
		};
	}

	addAssertion(input: Omit<
		ConstructorParameters<typeof Assertion>[0],
		| `parent`
	>) {
		const assertion = new Assertion({
			...input,
			parent: this,
		});
		this.children.push(assertion);
		return assertion;
	}

	addSuite(input: Omit<
		ConstructorParameters<typeof Suite>[0],
		| `parent`
	>) {
		const suite = new Suite({
			...input,
			parent: this,
		});
		this.children.push(suite);
		return suite;
	}

	toJSON() {
		return {
			...super.toJSON(),
			textHeader: this.message,
			children: this.children,
		};
	}
}

// #endregion

// #region SpecRunner

export class SpecRunner {
	_currentSuite: Suite;
	_rootSuite: Suite;

	constructor() {
		this._rootSuite = new Suite({
			callback: null,
			message: null,
			options: {},
			parent: null,
		});
		this._currentSuite = this._rootSuite;
	}

	assert(
		callback: Assertion[`callback`],
		options: AssertionOptions = {}
	) {
		this._currentSuite.addAssertion({
			callback,
			options,
		});
	}

	log(): string {
		return ``;
	}

	run(): Promise<void> {
		return new Promise((resolve) => resolve());
	}

	// TODO1: beforeEach

	test(
		message: string,
		callback: Suite[`callback`],
		options: SuiteOptions = {}
	) {
		const parent = this._currentSuite;
		const child = parent.addSuite({
			callback,
			message,
			options,
		});
		this._currentSuite = child;
		if (child.callback) {
			child.callback(this);
		}
		this._currentSuite = parent;
	}

	testx(/* eslint-disable-line @typescript-eslint/require-await */
		...args: Partial<Parameters<SpecRunner[`test`]>>
	) {
		const [message, callback, options] = args;
		return this.test(message, callback, {
			...options,
			dry: true,
		});
	}
}

// #endregion
