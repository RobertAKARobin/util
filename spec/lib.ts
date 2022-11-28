import * as $ from 'js/util';

const resultTypes = [`error`, `fail`, `pass`, `skip`] as const;

// #region SpecLogItem

type SpecLog = Array<string | SpecLog>;

abstract class SpecStep {
	callback: (...arg: Array<unknown>) => $.Type.PromiseMaybe<unknown>;
	children?: Array<SpecStep>;
	indexInCode: number;
	indexInExecution: number;
	log: SpecLog;
	parent: SpecStep;
	textPrefix: string;
	textTitle: string;

	constructor(
		input: Pick<
			SpecStep,
			| `parent`
			| `textTitle`
		>
	) {
		this.parent = input.parent;
		this.indexInCode = (this.parent?.children.length || 0) + 1;
		this.textPrefix = (
			this.parent
				?	(this.parent?.textPrefix || ``) + `${this.indexInCode}.`
				: ``
		);
		this.textTitle = input.textTitle;
		this.log = (
			(this.textPrefix && this.textTitle)
				? [`${this.textPrefix} ${this.textTitle}`]
				: []
		);
	}

	toJSON() { // TODO1: Don't use toJSON, probably
		return {
			textPrefix: this.textPrefix,
			textTitle: this.textTitle,
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
			& Omit<ConstructorParameters<typeof SpecStep>[0], `textTitle`>
			& Pick<Assertion, `callback` | `options`>
	) {
		super({
			...input,
			textTitle: input.callback.toString(),
		});
		this.callback = input.callback;
		this.options = {
			...assertionOptionsDefaults,
			...input.options,
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

class Suite extends SpecStep {
	callback: (arg: SpecRunner) => void; // TODO2: Make properties alphabetical
	children: Array<Suite | Assertion> = [];
	options: SuiteOptions = suiteOptionsDefaults;
	result: typeof resultTypes[number];

	constructor(
		input:
			& ConstructorParameters<typeof SpecStep>[0]
			& Pick<Suite, `callback` | `options`>
	) {
		super(input);
		this.callback = input.callback;
		this.options = {
			...suiteOptionsDefaults,
			...input.options,
		};
	}

	addAssertion(
		input: Omit<ConstructorParameters<typeof Assertion>[0], `parent`>
	) {
		const assertion = new Assertion({
			...input,
			parent: this,
		});
		this.children.push(assertion);
		this.log.push(assertion.log);
		return assertion;
	}

	addSuite(
		input: Omit<ConstructorParameters<typeof Suite>[0], `parent`>
	) {
		const suite = new Suite({
			...input,
			parent: this,
		});
		this.children.push(suite);
		this.log.push(suite.log);
		return suite;
	}

	toJSON() {
		return {
			...super.toJSON(),
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
			options: {},
			parent: null,
			textTitle: ``,
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

	// TODO1: beforeEach

	test(
		message: string,
		callback: Suite[`callback`],
		options: SuiteOptions = {}
	) {
		const parent = this._currentSuite;
		const child = parent.addSuite({
			callback,
			options,
			textTitle: message,
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
