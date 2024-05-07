import type * as $ from '../../types.d.ts';
import { roundTo } from '../../math/roundTo.ts';

import type * as Type from './types.d.ts';
import { specStepStatuses } from './runner.ts';

const match = {
	fatArrowParam: /^(?:\(([\w$]*).*?\)|([\w$]*))\s*=>\s*/,
	functionParam: /^function\s*(?:[\w$]*)\s*\(\s*([\w$]*).*?\)\s*(?=\{)/,
	valueWrapper: /\s*\((.*?)\)(?=[^)]*(?:\(|$))/.toString().slice(1, -1),
};

export class SpecRenderer<
	RenderOptions extends {
		showTiming: boolean;
	},
> {
	readonly renderOptions = <RenderOptions>{
		showTiming: true,
	};

	readonly statusIndicators: Record<Type.SpecStepStatusName, string> = {
		deferred: ` `,
		fail: `X`,
		pass: `•`,
	};

	readonly typeIndicators: Record<Type.SpecStepTypeName, string> = {
		assertion: `a`,
		log: `#`,
		suite: `s`,
		suiteIteration: `x`,
		test: `t`,
		testIteration: `x`,
	};

	constructor(
		inputOptions: Partial<RenderOptions> = {}
	) {
		this.renderOptions = {
			...this.renderOptions,
			...inputOptions,
		};
	}

	print = (...[rootSuiteResult, inputOptions]: Parameters<typeof this.render>) => {
		const failMatcher = new RegExp(`^${this.statusIndicators.fail} ${this.typeIndicators.suite}.*$`, `mg`);
		return console.log(
			this.render(rootSuiteResult, inputOptions)
				.replace(failMatcher, line => `\x1b[31m${line}\x1b[0m`),
		);
	};

	render = (
		rootSuiteResult: Type.SuiteResult,
		inputOptions: Partial<RenderOptions> = {},
	): string => {
		const maxCount = Math.max(...Object.values(rootSuiteResult.count));
		const maxCountPlaces = maxCount.toString().length;
		const options = {
			...this.renderOptions,
			...inputOptions,
		};

		return [
			`———`,
			...this.renderSuiteOrTest(rootSuiteResult, ``, options).flat(Infinity as 1), // https://github.com/microsoft/TypeScript/issues/49280
			``,
			`Total completed assertions: ${rootSuiteResult.count.totalAssertions}`,
			...specStepStatuses.map(statusName => {
				const count = rootSuiteResult.count[statusName];
				const countPadding = ` `.repeat(maxCountPlaces - count.toString().length); // For right-aligning numbers
				return `${this.statusIndicators[statusName]} ${countPadding}${count} ${statusName}`;
			}),
			``,
			`RESULT: ${rootSuiteResult.status.toUpperCase()}`,
			`———`,
		].join(`\n`);
	};

	renderAssertion(
		result: Type.AssertionResult,
		parentPrefix: string,
		_inputOptions: Partial<RenderOptions> = {},
	): $.Nested<string> {
		const indicator = this.statusIndicators[result.status];
		const prefix = `${indicator} ${parentPrefix}${this.typeIndicators.assertion}${result.indexAtDefinition + 1} ${indicator}`;

		let body = result.contents;

		if (body.startsWith(`async`)) {
			body = body.substring(`async`.length).trim();
		}

		let valueWrapperName: string | undefined;

		if (body.startsWith(`function`)) {
			body = body.replace(match.functionParam, (_, param: string) => {
				valueWrapperName = param?.trim();
				return ``;
			},);
		} else {
			body = body.replace(match.fatArrowParam, (_, braces: string, noBraces: string) => {
				valueWrapperName = (braces || noBraces)?.trim();
				return ``;
			});
		}

		if (body.startsWith(`{`)) {
			body = body.slice(1, -1); // Assume begins and ends with curlies
		}

		let valueWrapperMatcher: RegExp | undefined;
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

		const out: $.Nested<string> = [
			`${prefix} ${title}`,
		];

		if (result.status !== `fail`) {
			return out;
		}

		if (!valueWrapperMatcher) {
			return out;
		}

		const linePadding = ` `.repeat(prefix.length) + ` `;
		const linePaddingWithIndent = `${linePadding} `;

		const values = [...result.values];

		explanation = explanation.replace(valueWrapperMatcher, () => {
			const value = values.shift() as string;
			const lines = value.split(`\n`);
			if (lines.length === 1 && value.length < 20) {
				return `(${value})`;
			}

			const out = [`(`];
			for (const line of lines) {
				out.push(`${linePaddingWithIndent}${line}`);
			}
			out.push(`${linePadding})`);
			return out.join(`\n`);
		});

		if (explanation) {
			out.push(`${linePadding}${explanation}`);
		}

		return out;
	}

	renderSuiteOrTest(
		result: Type.SuiteResult | Type.TestResult,
		parentPrefix: string,
		inputOptions: Partial<RenderOptions> = {},
	): $.Nested<string> {
		const prefix = `${parentPrefix}${this.typeIndicators[result.type]}${result.indexAtDefinition + 1}`;
		const options = {
			...this.renderOptions,
			...inputOptions,
		};

		const indicator = this.statusIndicators[result.status];
		return [
			`  ${prefix} ${indicator} ${result.title}${options.showTiming ? ` <${roundTo(result.timeEnd - result.timeBegin, .01)}ms>` : ``}`,
			result.iterations.length > 1
				? result.iterations.map(iteration =>
					this.renderSuiteOrTestIteration(iteration, prefix, options)
				) : result.iterations[0].children.map(child =>
					this.renderSuiteOrTestIterationChild(child, prefix, options)
				),
		];
	}

	renderSuiteOrTestIteration(
		result: Type.SuiteIterationResult | Type.TestIterationResult,
		parentPrefix: string,
		inputOptions: Partial<RenderOptions> = {},
	): $.Nested<string> {
		const prefix = `${parentPrefix}${this.typeIndicators[result.type]}${result.indexAtDefinition + 1}`;
		const options = {
			...this.renderOptions,
			...inputOptions,
		};

		const indicator = this.statusIndicators[result.status];
		return [
			`  ${prefix} ${indicator}${options.showTiming ? ` <${roundTo(result.timeEnd - result.timeBegin, .01)}ms>` : ``}`,
			result.children.map(child =>
				this.renderSuiteOrTestIterationChild(child, prefix, options)
			),
		];
	}

	renderSuiteOrTestIterationChild(
		result:
			| Type.AssertionResult
			| Type.SpecLog
			| Type.SuiteResult
			| Type.TestResult,
		parentPrefix: string,
		inputOptions: Partial<RenderOptions> = {}
	) {
		const options = {
			...this.renderOptions,
			...inputOptions,
		};
		switch (result.type) {
			case `assertion`:
				return this.renderAssertion(result, parentPrefix, options);
			case `suite`:
				return this.renderSuiteOrTest(result as Type.SuiteResult, parentPrefix, options);
			case `test`:
				return this.renderSuiteOrTest(result as Type.TestResult, parentPrefix, options);
			default:
				return this.renderSuiteOrTestLog(result  as Type.SpecLog, parentPrefix, options);
		}
	}

	renderSuiteOrTestLog(
		result: Type.SpecLog,
		parentPrefix: string,
		_inputOptions: Partial<RenderOptions> = {}
	): string {
		return `  ${parentPrefix}${this.typeIndicators.log}  ${result.message}`;
	}

	run = (
		results: Type.SuiteResult,
		options: Partial<RenderOptions & {
			verbose: boolean;
		}> = {}
	) => {
		if (results.count.fail > 0) {
			this.print(results, options);
			process.exit(1);
		} else {
			if (options.verbose === true) {
				this.print(results, options);
			}
			process.exit(0);
		}
	};
}
