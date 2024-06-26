import type * as $ from '../../types.d.ts';

import type { specStepStatuses, specStepTiming, specStepTypes } from './runner.ts';

//#region SpecStep
export type SpecLog = SpecResult & {
	message: string;
	time: number;
	type: Extract<SpecStepTypeName, `log`>;
};

export type SpecLogMessage =
	| string
	| (() => Promise<unknown>)
	| (() => unknown);


export function SpecLogFactory(message: SpecLogMessage): void;

export type SpecResult = {
	type: SpecStepTypeName;
};

export type SpecStepCount = Record<
	|	SpecStepStatusName
	| `totalAssertions`,
	number
>;

export type SpecStepIterationResult<Child extends SpecResult> = SpecStepResult & {
	children: Array<Child>;
};

export type SpecStepResult = SpecResult & {
	count: SpecStepCount;
	indexAtDefinition: number;
	status: SpecStepStatusName;
	timeBegin: number;
	timeEnd: number;
};

export type SpecStepStatusName = typeof specStepStatuses[number];

export type SpecStepTiming = typeof specStepTiming[number];

export type SpecStepTypeName = typeof specStepTypes[number];
//#endregion

//#region Assertion
export function Assertion(valueWrap: typeof AssertionValueWrap): Promise<boolean> | boolean;

export function AssertionFactory(
	assertion: (valueWrap: typeof AssertionValueWrap) => boolean
): void;
export function AssertionFactory(
	assertion: (valueWrap: typeof AssertionValueWrap) => Promise<boolean>
): Promise<void>;

export function AssertionValueWrap <Value>(value: Value): Value;

export type AssertionResult = Omit<SpecStepResult, `count`> & {
	contents: string;
	type: Extract<SpecStepTypeName, `assertion`>;
	values: Array<string>;
};
//#endregion

//#region Suite
export type SuiteIterationOptions<
	InheritedArgs,
	Args,
> = Omit<SuiteOptions<InheritedArgs, Args>, `iterations`>;

export type SuiteIterationResult = SpecStepIterationResult<SuiteResult | TestResult> & {
	type: Extract<SpecStepTypeName, `suiteIteration`>;
};

export type SuiteOptions<
	InheritedArgs,
	Args,
> = {
	args: (inheritedArgs: InheritedArgs) => $.PromiseMaybe<Args>;
	iterations: number;
	timing: SpecStepTiming;
};

export type SuiteResult = SpecStepResult & {
	iterations: Array<SuiteIterationResult>;
	timing: SpecStepTiming;
	title: string;
	type: Extract<SpecStepTypeName, `suite`>;
};
//#endregion

//#region Test
export function Test<Args>(
	args: Args,
	index?: number,
): Promise<TestResult>;

export function TestDefinition<Args>(input: {
	args: Args;
	assert: typeof AssertionFactory;
	log: typeof SpecLogFactory;
}): Promise<void> | void;

export type TestIterationResult = SpecStepIterationResult<AssertionResult | SpecLog> & {
	type: Extract<SpecStepTypeName, `testIteration`>;
};

export type TestOptions = {
	iterations: number;
	timing: SpecStepTiming;
};

export type TestResult = SpecStepResult & {
	iterations: Array<TestIterationResult>;
	timing: SpecStepTiming;
	title: string;
	type: Extract<SpecStepTypeName, `test`>;
};
//#endregion
