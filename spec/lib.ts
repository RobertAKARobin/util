import * as $ from 'js/util';

const resultTypes = [`error`, `fail`, `pass`, `skip`] as const;

// #region SpecLogItem

type SpecLog = Array<string | SpecLog>;

interface SpecStepOptions {
	dry: boolean;
}

abstract class SpecStep {
	callback: (...arg: Array<unknown>) => $.Type.PromiseMaybe<unknown>;
	children?: Array<SpecStep>;
	indexInCode: number;
	indexInExecution: number;
	log: SpecLog;
	options: Partial<SpecStepOptions> = {};
	parent: SpecStep;
	textPrefix: string;
	textTitle: string;

	constructor(
		input: Pick<
			SpecStep,
			| `options` // TODO3: Require these to be alphabetized
			| `parent`
			| `textTitle`
		>
	) {
		this.options = {
			...this.options,
			...input.options,
		};
		this.parent = input.parent;
		this.textTitle = input.textTitle;

		this.indexInCode = (this.parent?.children.length || 0) + 1;
		this.textPrefix = (
			this.parent
				?	(this.parent?.textPrefix || ``) + `${this.indexInCode}.`
				: ``
		);
		this.log = (
			(this.textPrefix && this.textTitle)
				? [`${this.textPrefix} ${this.textTitle}`]
				: []
		);
	}

	toJSON() {
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

interface AssertionOptions extends SpecStepOptions {}

class Assertion extends SpecStep {
	callback: (arg: typeof assertionHelpers) => boolean;
	options: Partial<AssertionOptions> = {};
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
	}
}

// #endregion

// #region Suites

interface SuiteOptions extends SpecStepOptions {
	shuffle: boolean;
}

class Suite extends SpecStep {
	callback: (arg: SpecRunner) => void; // TODO2: Make properties alphabetical
	children: Array<Suite | Assertion> = [];
	options: Partial<SuiteOptions> = {
		dry: true,
		shuffle: false,
	};
	result: typeof resultTypes[number];

	constructor(
		input:
			& ConstructorParameters<typeof SpecStep>[0]
			& Pick<Suite, `callback` | `options`>
	) {
		super(input);
		this.callback = input.callback;
	}

	addAssertion(
		input: Omit<ConstructorParameters<typeof Assertion>[0], `parent`>
	) {
		const assertion = new Assertion({
			...input,
			options: {
				...this.options || {},
				...input.options || {},
			},
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
			options: {
				...this.options || {},
				...input.options || {},
			},
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
	_rootSuite: Suite; // TODO2: Make private

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
		options: Partial<AssertionOptions> = {}
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
		options: Partial<SuiteOptions> = {}
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
