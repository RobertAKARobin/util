import * as Type from './types.d';

export { Type };

export function debounce(
	callback: () => void,
	time: number,
) {
	let timer: number = null;
	return function() {
		clearTimeout(timer);
		timer = setTimeout(() => {
			callback();
			timer = null;
		}, time);
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
	return (typeof val === `object` ? null : (typeof val !== `function`));
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
	let timer: number = null;
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
