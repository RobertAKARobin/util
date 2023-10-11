import type * as Type from './types.d.ts';

export type { Type };

export function arrayToEnum<Value extends string>(
	input: Array<Value>,
) {
	return input.reduce((output, value, index) => {
		(output as Record<Value, number>)[value] = index;
		(output as Record<number, Value>)[index] = value;
		return output;
	}, {} as Record<Value, number> & Record<number, Value>);
}

export function debounce(
	callback: () => void,
	time: number,
) {
	let timer: Type.Timer | null = null;
	return function() {
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			callback();
			timer = null;
		}, time);
	};
}

export function defineSetter<Target, PropertyName extends keyof Target>(
	target: Target,
	propertyName: PropertyName,
) {
	return {
		set: (value: Target[PropertyName]) => {
			target[propertyName] = value;
		},
	};
}

export function delay(
	callback: () => unknown,
	time: number,
) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(callback()), time);
	});
}

/**
 * Map each of the specified keys in an object to an array of values
 * @param _options.assertAll - If true, throws an error if not all of the object's keys are specified
 */
export function fromKeys<Value>(
	keys: Array<string>,
	input: Record<string, Value>,
	_options: typeof fromKeys[`options`] = fromKeys.options,
) {
	const options = { ...fromKeys.options, ..._options };

	if (options.assertAll) {
		const delimeter = `;`;
		const inputKeys = Object.keys(input).sort().join(delimeter);
		const outputKeys = keys.sort().join(delimeter);
		if (inputKeys !== outputKeys) {
			throw new Error(`Not all keys are used:\nInput keys: ${inputKeys}\nOutput keys: ${outputKeys}`);
		}
	}

	return keys.map((key) => {
		if (!input[key]) {
			throw new Error(`'${key}' is not a valid key.`);
		} else {
			return input[key];
		}
	});
}
fromKeys.options = {
	assertAll: true as boolean,
};

export function isDefinedAndSame(a: unknown, b:unknown): boolean {
	return (
		(typeof a !== `undefined`)
		&& (typeof b !== undefined)
		&& a === b
	);
}

export function isPrimitive(val: unknown): boolean {
	return (typeof val === `object` ? false : (typeof val !== `function`));
}

type nTimesCallback<Value> = (
	nil: undefined,
	index: number,
) => Value;
export function nTimes<Value>(
	number: number,
	contents?:
		| Value
		| nTimesCallback<Value>,
): Array<Value> {
	if (contents) {
		if (typeof contents === `function`) {
			return Array.from(Array(number), contents as nTimesCallback<Value>);
		} else {
			return Array(number).fill(contents) as Array<Value>;
		}
	} else {
		return Array.from(Array(number)) as Array<Value>;
	}
}

export async function promiseConsecutive<Value>(
	inputs: Array<(soFar: Array<Value>, index: number) => Promise<Value>>
): Promise<Array<Value>> {
	const out: Array<Value> = [];
	// TODO3: Use `for await..of` instead?
	await inputs.reduce(async(previous, input, index) => {
		await previous;
		out.push(await input(out, index));
	}, Promise.resolve());
	return out;
}

export function roundTo(input: number, places = 2) {
	const factor = Math.pow(10, places);
	return Math.round(input * factor) / factor;
}

export function sleep(time: number) {
	return delay(() => undefined, time);
}

export function throttle(
	callback: () => unknown,
	time: number,
) {
	let timer: Type.Timer | null = null;
	return function() {
		if (timer) {
			return;
		}

		timer = setTimeout(() => {
			callback();
			timer = null;
		}, time);
	};
}

export function toArray<Value>(input: Type.OneOrMany<Value>): Array<Value> {
	return (input instanceof Array ? input : [input]);
}

export function toKeys<Key extends string | number | symbol, Fill>(
	input: Array<Key> | Readonly<Array<Key>>,
	fill: Fill
) {
	const output = {} as Record<Key, Fill>;
	for (const key of input) {
		output[key] = fill;
	}
	return output;
}

export function traverseMap<
	PropertyName extends string,
	Target extends Record<PropertyName, Target>
>(
	input: Target,
	propertyName: PropertyName,
) {
	const ancestors: Array<Target> = [];
	let current: Target = input;
	while (current) {
		ancestors.push(current);
		current = current[propertyName];
	}
	return ancestors;
}

export function tryCatch<Result>(
	callback: () => (Result extends Promise<unknown> ? never : Result),
): Result | Error;
export function tryCatch<Result, DefaultIfError>(
	callback: () => (Result extends Promise<unknown> ? never : Result),
	defaultIfError: DefaultIfError,
): Result | DefaultIfError;
export function tryCatch<Result>(
	callback: () => Result,
): Result | Promise<Error>;
export function tryCatch<Result, DefaultIfError>(
	callback: () => Result,
	defaultIfError: DefaultIfError,
): Result | Promise<DefaultIfError>;
export function tryCatch<Result, DefaultIfError>(
	callback: () => Result,
	defaultIfError?: DefaultIfError
) {
	try {
		const result = callback();
		if (result instanceof Promise) {
			if (typeof defaultIfError === `undefined`) {
				return result.catch((error: Error) => error) as Result | Promise<Error>;
			}
			return result.catch(() => defaultIfError) as Result | Promise<DefaultIfError>;
		} else {
			return result;
		}
	} catch (error: unknown) {
		if (typeof defaultIfError === `undefined`) {
			return error as Error;
		}
		return defaultIfError;
	}
}
