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
	}) => $.Type.PromiseMaybe<void>
) {
	console.log(message);
	await callback({ assert, beforeEach, test, testx });
}

export function testx(
	...args: Partial<Parameters<typeof test>>
) {
	const [message] = args;
	console.log(message);
}

export function valueWrap<Value>(value: Value) {
	console.log(value);
	return value;
}
