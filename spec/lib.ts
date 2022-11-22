import * as $ from 'js/util';

export async function assert(
	callback: (arg: typeof valueWrap) => $.Type.PromiseMaybe<boolean>
) {
	const result = await callback(valueWrap);
	console.log(result);
}

export async function beforeEach(
	callback: () => $.Type.PromiseMaybe<void>
) {
	console.log(`beforEach`);
	await callback();
}

export async function test(
	message: string,
	callback: (arg: {
		assert: typeof assert;
		beforeEach: typeof beforeEach;
		test: typeof test;
		testx: typeof testx;
		thrown: typeof thrown;
	}) => $.Type.PromiseMaybe<void>
) {
	console.log(message);
	await callback({ assert, beforeEach, test, testx, thrown });
}

export function testx(
	...args: Partial<Parameters<typeof test>>
) {
	const [message] = args;
	console.log(message);
}

export function thrown(
	callback: (...args: unknown[]) => void
): Error | null {
	try {
		callback();
	} catch (error) {
		return error as Error;
	}
	return null;
}

export function valueWrap<Value>(value: Value) {
	console.log(value);
	return value;
}
