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

type SuiteHelpers = Pick<Suite,
	| `assert`
	| `test`
	| `testx`
>;

export class Suite extends SpecStep {
	callback: (arg: SuiteHelpers) => void; // TODO2: Make properties alphabetical
	children: Array<Suite | Assertion> = [];
	helpers: SuiteHelpers = {
		assert: this.assert.bind(this),
		test: this.test.bind(this),
		testx: this.testx.bind(this),
	};
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

	assert(
		callback: Assertion[`callback`],
		options: Partial<AssertionOptions> = {}
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
		this.log.push(assertion.log);
		// assertion.callback(assertionHelpers);
		return assertion;
	}

	// TODO1: beforeEach

	test(
		message: string,
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
			textTitle: message,
		});
		this.children.push(suite);
		this.log.push(suite.log);
		if (suite.options.dry && suite.callback) { // Needed for testx
			suite.callback(suite.helpers);
		}
		return suite;
	}

	testx(/* eslint-disable-line @typescript-eslint/require-await */
		...args: Partial<Parameters<Suite[`test`]>>
	) {
		const [message, callback, options] = args;
		return this.test(message, callback, {
			...options,
			dry: true,
		});
	}

	toJSON() {
		return {
			...super.toJSON(),
			children: this.children,
		};
	}
}

// #endregion
