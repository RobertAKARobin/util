/**
 * @import * as $ from '../../types.d';
 * @import * as Type from './types.d';
 * @import {SpecBuilder} from './builder.js';
 */

import { roundTo } from '../../math/roundTo.js';

import { specStepStatuses } from './builder.js';

const match = {
	fatArrowParam: /^(?:\(([\w$]*).*?\)|([\w$]*))\s*=>\s*/,
	functionParam: /^function\s*(?:[\w$]*)\s*\(\s*([\w$]*).*?\)\s*(?=\{)/,
	valueWrapper: /\s*\((.*?)\)(?=[^)]*(?:\(|$))/.toString().slice(1, -1), // TODO3: Why did I use toString here? Something having to do escaping special characters, I think... Some tests break without it. Shame on me for not documenting. >:(
};

/**
 * Controls how to convert the output of SpecBuilder, which is basically a big JSON blob, into a nice string (or whatever)
 * @template {Type.SpecRenderOptions} RenderOptions
 */
export class SpecRenderer {
	/**
	 * See {@link Type.SpecRenderOptions}
	 * @readonly
	 */
	renderOptions = /** @type {RenderOptions} */({
		format: (_result, text) => text,
		showTiming: true,
	});

	/**
	 * Which character should be printed for each spec result status
	 * @type {Record<Type.SpecStepStatusName, string>}
	 * @readonly
	 */
	statusIndicators = {
		deferred: ` `,
		fail: `X`,
		pass: `•`,
	};

	/**
	 * Which character should be printed for each spec type
	 * @type {Record<Type.SpecStepTypeName, string>}
	 * @readonly
	 */
	typeIndicators = {
		assertion: `a`,
		log: `#`,
		suite: `s`,
		suiteIteration: `x`,
		test: `t`,
		testIteration: `x`,
	};

	/**
	 * @param {Partial<RenderOptions>} [inputOptions]
	 */
	constructor(
		inputOptions = {},
	) {
		this.renderOptions = {
			...this.renderOptions,
			...inputOptions,
		};

		this.print = this.print.bind(this);
		this.render = this.render.bind(this);
	}

	/**
	 * Just console-logs the output of {@link render}, if any.
	 * @param {Type.SuiteResult} rootSuiteResult
	 * @param {object} [inputOptions]
	 * @param {RenderOptions['format']} [inputOptions.format] - See {@link Type.SpecRenderOptions}
	 * @param {RenderOptions['showTiming']} [inputOptions.showTiming] - See {@link Type.SpecRenderOptions}
	 * @param {boolean} [inputOptions.verbose=false] - If true, logs the whole stringified suite. Otherwise just logs failures/errors.
	 * @param {boolean} [inputOptions.exit=false] - If true,s exits 1 if the overall result was a fail, 0 if it was a pass.
	 * @returns {void}
	 */
	print(
		rootSuiteResult,
		inputOptions = {},
	) {
		if (inputOptions.verbose === true) {
			console.log(
				this.render(
					rootSuiteResult,
					/** @type {RenderOptions} */(inputOptions),
				),
			);
		}

		if (inputOptions.exit === true) {
			if (rootSuiteResult.count.fail > 0) {
				process.exit(1);
			} else {
				process.exit(0);
			}
		}
	};

	/**
	 * How to render the root suite
	 * @param {Type.SuiteResult} rootSuiteResult
	 * @param {Partial<RenderOptions>} [inputOptions]
	 * @returns {string}
	 */
	render(
		rootSuiteResult,
		inputOptions = {},
	) {
		const maxCount = Math.max(...Object.values(rootSuiteResult.count));
		const maxCountPlaces = maxCount.toString().length;
		const options = {
			...this.renderOptions,
			...inputOptions,
		};

		const text = [
			`———`,
			...this.renderSuiteOrTest(rootSuiteResult, ``, options).flat(
				/** @type {1} */(Infinity), // https://github.com/microsoft/TypeScript/issues/49280
			),
			`Total completed assertions: ${rootSuiteResult.count.totalAssertions}`,
			...specStepStatuses.map(statusName => {
				const count = rootSuiteResult.count[statusName];
				const countPadding = ` `.repeat(maxCountPlaces - count.toString().length); // For right-aligning numbers
				return `${this.statusIndicators[statusName]} ${countPadding}${count} ${statusName}`;
			}),
			`RESULT: ${rootSuiteResult.status.toUpperCase()}`,
			`———`,
		]
			.filter(line => /** @type {string} */(line).trim() !== ``)
			.join(`\n`);
		return options.format(rootSuiteResult, [text]).join(``);
	};

	/**
	 * How to render an assertion
	 * @param {Type.AssertionResult} result
	 * @param {string} parentPrefix
	 * @param {Partial<RenderOptions>} [inputOptions]
	 * @returns {$.Nested<string>}
	 */
	renderAssertion(
		result,
		parentPrefix,
		inputOptions = {},
	) {
		const options = {
			...this.renderOptions,
			...inputOptions,
		};

		const indicator = this.statusIndicators[result.status];
		const prefix = `${indicator} ${parentPrefix}${this.typeIndicators.assertion}${result.indexAtDefinition + 1} ${indicator}`;

		let body = result.contents;

		if (body.startsWith(`async`)) {
			body = body.substring(`async`.length).trim();
		}

		/** @type {string | undefined} */
		let valueWrapperName;

		if (body.startsWith(`function`)) {
			body = body.replace(match.functionParam, (_, /** @type {string} */param) => {
				valueWrapperName = param?.trim();
				return ` `;
			});
		} else {
			body = body.replace(match.fatArrowParam, (
				_,
				/** @type {string} */braces,
				/** @type {string} */noBraces,
			) => {
				valueWrapperName = (braces || noBraces)?.trim();
				return ` `;
			});
		}

		if (body.startsWith(`{`)) {
			body = body.slice(1, -1); // Assume begins and ends with curlies
		}

		/** @type {RegExp | undefined} */
		let valueWrapperMatcher;
		let explanation = body;

		if (valueWrapperName !== undefined) {
			const valueWrapperPrefix = valueWrapperName.startsWith(`$`)
				? `\\$${valueWrapperName.substring(1)}`
				: `\\b${valueWrapperName}`; // JS variables can start with `$` which is a special character in RegEx that doesn't play nice with `\b`
			valueWrapperMatcher = new RegExp(`${valueWrapperPrefix}${match.valueWrapper}`, `gs`);

			body = body.replace(valueWrapperMatcher, (_, value) => `(${value})`);
		}

		let title = body;
		const lines = title.split(`\n`);
		if (lines.length > 1) {
			title = `${lines[0]}...`;
		}

		const out = /** @type {$.Nested<string>} */([
			`${prefix}${title}`,
		]);

		if (result.status !== `fail`) {
			return options.format(result, out);
		}

		if (valueWrapperMatcher === undefined || valueWrapperMatcher === null) {
			return options.format(result, out);
		}

		const linePadding = ` `.repeat(prefix.length);

		const values = [...result.values];

		explanation = explanation.replace(valueWrapperMatcher, () => {
			const value = /** @type {string} */(values.shift());

			const lines = value.split(`\n`);
			if (lines.length === 1 && value.length < 20) {
				return `(${value})`;
			}

			const out = [`(`];
			for (const line of lines) {
				out.push(`${linePadding}  ${line}`);
			}
			out.push(`${linePadding} )`);
			return out.join(`\n`);
		});

		if (explanation) {
			out.push(`${linePadding}${explanation}`);
		}

		return options.format(result, out);
	}

	/**
	 * How to render a suite or test
	 * @param {Type.SuiteResult | Type.TestResult} result
	 * @param {string} parentPrefix
	 * @param {Partial<RenderOptions>} [inputOptions]
	 * @returns {$.Nested<string>}
	 */
	renderSuiteOrTest(
		result,
		parentPrefix,
		inputOptions = {},
	) {
		const prefix = `${parentPrefix}${this.typeIndicators[result.type]}${result.indexAtDefinition + 1}`;
		const options = {
			...this.renderOptions,
			...inputOptions,
		};

		const indicator = this.statusIndicators[result.status];
		return options.format(result, [
			`  ${prefix} ${indicator} ${result.title}${options.showTiming ? ` <${roundTo(result.timeEnd - result.timeBegin, .01)}ms>` : ``}`,
			result.iterations.length > 1
				? result.iterations.map(iteration =>
					this.renderSuiteOrTestIteration(iteration, prefix, options),
				) : result.iterations[0].children.map(child =>
					this.renderSuiteOrTestIterationChild(child, prefix, options),
				),
		]);
	}

	/**
	 * How to render an iteration of a suite or test
	 * @param {Type.SuiteIterationResult | Type.TestIterationResult} result
	 * @param {string} parentPrefix
	 * @param {Partial<RenderOptions>} [inputOptions]
	 * @returns {$.Nested<string>}
	 */
	renderSuiteOrTestIteration(
		result,
		parentPrefix,
		inputOptions = {},
	) {
		const prefix = `${parentPrefix}${this.typeIndicators[result.type]}${result.indexAtDefinition + 1}`;
		const options = {
			...this.renderOptions,
			...inputOptions,
		};

		const indicator = this.statusIndicators[result.status];
		return options.format(result, [
			`  ${prefix} ${indicator}${options.showTiming ? ` <${roundTo(result.timeEnd - result.timeBegin, .01)}ms>` : ``}`,
			result.children.map(child =>
				this.renderSuiteOrTestIterationChild(child, prefix, options),
			),
		]);
	}

	/**
	 * How to render a child of an iteration of a suite or test
	 * @param {Type.AssertionResult | Type.SpecLog | Type.SuiteResult | Type.TestResult} result
	 * @param {string} parentPrefix
	 * @param {Partial<RenderOptions>} [inputOptions]
	 * @returns {$.Nested<string>}
	 */
	renderSuiteOrTestIterationChild(
		result,
		parentPrefix,
		inputOptions = {},
	) {
		const options = {
			...this.renderOptions,
			...inputOptions,
		};
		switch (result.type) {
			case `assertion`:
				return this.renderAssertion(result, parentPrefix, options);
			case `suite`:
				return this.renderSuiteOrTest(result, parentPrefix, options);
			case `test`:
				return this.renderSuiteOrTest(result, parentPrefix, options);
			default:
				return this.renderSuiteOrTestLog(result, parentPrefix, options);
		}
	}

	/**
	 * How to render a {@link SpecBuilder.log}
	 * @param {Type.SpecLog} result
	 * @param {string} parentPrefix
	 * @param {Partial<RenderOptions>} [inputOptions]
	 * @returns {$.Nested<string>}
	 */
	renderSuiteOrTestLog(
		result,
		parentPrefix,
		inputOptions = {},
	) {
		const options = {
			...this.renderOptions,
			...inputOptions,
		};

		return options.format(result, [
			`  ${parentPrefix}${this.typeIndicators.log}  ${result.message}`,
		]);
	}
}
