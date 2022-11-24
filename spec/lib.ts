/* eslint-disable */

const resultTypes = [`error`, `fail`, `pass`, `skip`] as const;

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

class Assertion {
	callback: (arg: typeof assertionHelpers) => boolean;
	indexInCode: number;
	indexInExecution: number;
	options: AssertionOptions;
	parent: Suite | null;
	result: typeof resultTypes[number];

	toJSON() {
		return this.callback.toString();
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

class Suite {
	callback: (arg: SpecRunner) => void; // TODO2: Make properties alphabetical
	children: Array<Suite | Assertion> = [];
	index: number;
	message: string;
	options: SuiteOptions = suiteOptionsDefaults;
	parent: Suite | null;
	prefix = ``;
	result: typeof resultTypes[number];

	addAssertion(input: Pick< // TODO2: Make methods alphabetical
		Assertion,
		| `callback`
		| `options`
	>) {
		const assertion = new Assertion();
		assertion.callback = input.callback;
		assertion.indexInCode = this.children.length;
		assertion.parent = this;
		assertion.options = {
			...assertionOptionsDefaults,
			...input.options,
		};
		this.children.push(assertion);
		return assertion;
	}

	addSuite(input: Pick<
		Suite,
		| `callback`
		| `message`
		| `options`
	>) {
		const suite = new Suite();
		suite.callback = input.callback;
		suite.message = input.message;
		suite.options = {
			...suiteOptionsDefaults,
			...input.options,
		};
		suite.parent = this;
		this.children.push(suite);
		return suite;
	}

	toJSON() {
		return {
			message: this.message,
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
		this._rootSuite = new Suite();
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

	assertx(
		...args: Parameters<SpecRunner[`assert`]>
	) {
		const [callback, options] = args;
		return this.assert(callback, {
			...options,
			dry: true,
		});
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
