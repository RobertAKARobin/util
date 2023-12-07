// TODO3: Extract all these out to own files for better tree-shaking

import type * as Type from './types.d.ts';

export type { Type };

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

/**
 * Map each of the specified keys in an object to an array of values
 * @param _options.assertAll - If true, throws an error if not all of the object's keys are specified
 */
export function fromKeys<Value>(
	keys: Array<string>,
	input: Record<string, Value>,
	options: {
		assertAll: boolean;
	} = {
		assertAll: true,
	}
) {
	if (options.assertAll) {
		const delimeter = `;`;
		const inputKeys = Object.keys(input).sort().join(delimeter);
		const outputKeys = keys.sort().join(delimeter);
		if (inputKeys !== outputKeys) {
			throw new Error(`Not all keys are used:\nInput keys: ${inputKeys}\nOutput keys: ${outputKeys}`);
		}
	}

	return keys.map(key => {
		if (input[key] === undefined) {
			throw new Error(`'${key}' is not a valid key.`);
		} else {
			return input[key];
		}
	});
}

export function isDefinedAndSame(a: unknown, b:unknown): boolean {
	return (
		(typeof a !== `undefined`)
		&& (typeof b !== `undefined`)
		&& a === b
	);
}

export function isPrimitive(val: unknown): boolean {
	return (typeof val === `object` ? false : (typeof val !== `function`));
}

export function omit<Source, Keys extends Array<keyof Source>>(
	source: Source,
	...keys: Keys
) {
	const output = { ...source };
	for (const key of keys) {
		delete output[key];
	}
	return output as Omit<Source, Keys[number]>;
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
	Target extends Record<PropertyName, Target>,
>(
	input: Target,
	propertyName: PropertyName,
) {
	const ancestors: Array<Target> = [];
	let current: Target = input;
	while (current !== undefined) {
		ancestors.push(current);
		current = current[propertyName];
	}
	return ancestors;
}

export function newUid() {
	return Math.random().toString(36).slice(-5); // TODO2: Better UID generator. Doesn't have to actually be unique, just unlikely to repeat within app
}
