import * as $ from '@robertakarobin/util/index.ts';

import { specStepStatuses } from './runner.ts';
import type * as Type from './types.d.ts';

// export type SpecRenderOptions = ReturnType<typeof renderOptionsDefaults>;

const match = {
	fatArrowParam: /^(?:\(([\w$]*).*?\)|([\w$]*))\s*=>\s*/,
	functionParam: /^function\s*(?:[\w$]*)\s*\(\s*([\w$]*).*?\)\s*(?=\{)/,
	valueWrapper: /\s*\((.*?)\)(?=[^\)]*(?:\(|$))/.toString().slice(1, -1),
};

export class SpecRenderer<
	RenderOptions extends {
		showTiming: boolean
	}
> {
	readonly renderOptions = <RenderOptions>{
		showTiming: true,
	};

	readonly statusIndicators: Record<Type.SpecStepStatusName, string> = {
		deferred: ` `,
		fail: `X`,
		log: `#`,
		pass: `•`,
	};

	readonly typeIndicators: Record<Type.SpecStepTypeName, string> = {
		assertion: `a`,
		log: `#`,
		suite: `s`,
		suiteIteration: `x`,
		test: `t`,
		testIteration: `x`
	};

	constructor(
		inputOptions: Partial<RenderOptions> = {}
	) {
		this.renderOptions = {
			...this.renderOptions,
			...inputOptions,
		};
		this.print = this.print.bind(this);
		this.render = this.render.bind(this);
	}

	print(...[rootSuiteResult, inputOptions]: Parameters<typeof this.render>): void {
		return console.log(this.render(rootSuiteResult, inputOptions));
	}

	render(
		rootSuiteResult: Type.SuiteResult,
		inputOptions: Partial<RenderOptions> = {},
	): string {
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
			...specStepStatuses.map((statusName) => {
				const count = rootSuiteResult.count[statusName];
				const countPadding = ` `.repeat(maxCountPlaces - count.toString().length); // For right-aligning numbers
				return `${this.statusIndicators[statusName]} ${countPadding}${count} ${statusName}`;
			}),
			`———`,
		].join(`\n`);
	}

	renderAssertion(
		result: Type.AssertionResult,
		parentPrefix: string,
		inputOptions: Partial<RenderOptions> = {},
	): $.Type.Nested<string> {
		const indicator = this.statusIndicators[result.status];
		const prefix = `${indicator} ${parentPrefix}${this.typeIndicators.assertion}${result.indexAtDefinition + 1} ${indicator}`;

		let title = result.contents;

		const lines = title.split(`\n`);
		if (lines.length > 1) {
			title = `${lines[0]}...`; // TODO3: Better handling of multiline assertions
		}

		if (title.startsWith(`async`)) {
			title = title.substring(`async`.length).trim();
		}

		let valueWrapperName: string | undefined;

		if (title.startsWith(`function`)) {
			title = title.replace(match.functionParam, (_, param) => {
				valueWrapperName = param?.trim();
				return ``;
			},);
		} else {
			title = title.replace(match.fatArrowParam, (_, ifBraces, ifNoBraces) => {
				valueWrapperName = (ifBraces || ifNoBraces)?.trim();
				return ``;
			});
		}

		if (title.startsWith(`{`)) {
			title = title.slice(1, -1); // Assume begins and ends with curlies
		}

		let valueWrapperMatcher: RegExp | undefined;
		let explanation = title;

		if (valueWrapperName) {
			const valueWrapperPrefix = valueWrapperName.startsWith(`$`)
			? `\\$${valueWrapperName.substring(1)}`
			: `\\b${valueWrapperName}`; // JS variables can start with `$` which is a special character in RegEx that doesn't play nice with `\b`
			valueWrapperMatcher = new RegExp(`${valueWrapperPrefix}${match.valueWrapper}`, `g`);

			title = title.replace(valueWrapperMatcher, (_, value) => `(${value})`);
		}

		const out: $.Type.Nested<string> = [
			`${prefix} ${title}`
		];

		if (result.status !== `fail`) {
			return out;
		}

		if (!valueWrapperMatcher) {
			return out;
		}

		const linePadding = ` `.repeat(prefix.length) + ` `;

		const values = [...result.values];
		explanation = explanation.replace(valueWrapperMatcher, () => {
			let value = values.shift() as string;
			const lines = value.split(`\n`);
			const linePaddingWithIndent = `\n${linePadding} `;
			if (lines.length > 1) {
				value = linePaddingWithIndent + lines.join(linePaddingWithIndent) + `\n${linePadding}`;
			}
			return `(${value})`;
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
	): $.Type.Nested<string> {
		const prefix = `${parentPrefix}${this.typeIndicators[result.type]}${result.indexAtDefinition + 1}`;
		const options = {
			...this.renderOptions,
			...inputOptions,
		};

		const indicator = this.statusIndicators[result.status];
		return [
			`  ${prefix} ${indicator} ${result.title}${options.showTiming ? ` <${$.roundTo(result.timeEnd - result.timeBegin, 2)}ms>` : ``}`,
			result.iterations.length > 1
				? result.iterations.map(iteration =>
						this.renderSuiteOrTestIteration(iteration, prefix, options)
				) : result.iterations[0].children.map(child =>
						this.renderSuiteOrTestIterationChild(child, prefix, options)
				)
		];
	}

	renderSuiteOrTestIteration(
		result: Type.SuiteIterationResult | Type.TestIterationResult,
		parentPrefix: string,
		inputOptions: Partial<RenderOptions> = {},
	): $.Type.Nested<string> {
		const prefix = `${parentPrefix}${this.typeIndicators[result.type]}${result.indexAtDefinition + 1}`;
		const options = {
			...this.renderOptions,
			...inputOptions,
		};

		const indicator = this.statusIndicators[result.status];
		return [
			`  ${prefix} ${indicator}${options.showTiming ? ` <${$.roundTo(result.timeEnd - result.timeBegin, 2)}ms>` : ``}`,
			result.children.map(child =>
				this.renderSuiteOrTestIterationChild(child, prefix, options)
			)
		];
	}

	renderSuiteOrTestIterationChild(
		result:
			| Type.AssertionResult
			|	Type.SuiteResult
			| Type.SpecLog
			| Type.TestResult,
		parentPrefix: string,
		inputOptions: Partial<RenderOptions> = {}
	) {
		const options = {
			...this.renderOptions,
			...inputOptions,
		};
		switch(result.type) {
			case `assertion`:
				return this.renderAssertion(result as Type.AssertionResult, parentPrefix, options);
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
		inputOptions: Partial<RenderOptions> = {}
	): string {
		return `${this.statusIndicators.log} ${parentPrefix}${this.typeIndicators.log} ${result.message}`;
	}
}
