import * as $ from 'js/util';

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

export class SuiteContext {
	async assert(
		callback: (arg: typeof assertionHelpers) => $.Type.PromiseMaybe<boolean>
	) {
		const result = await callback(assertionHelpers);
		console.log(result);
	}

	async beforeEach(
		callback: () => $.Type.PromiseMaybe<void>
	) {
		console.log(`beforEach`);
		await callback();
	}

	async test(
		message: string,
		callback: (arg: this) => $.Type.PromiseMaybe<void>
	) {
		console.log(message);
		await callback(this);
	}

	testx(
		...args: Partial<Parameters<SuiteContext[`test`]>>
	) {
		const [message] = args;
		console.log(message);
	}
}
