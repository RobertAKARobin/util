import * as Type from './types.d';

export * from './fromKeys';
export * from './timer';
export { Type };

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

export function toArray<Value>(input: Type.OneOrMany<Value>): Array<Value> {
	return (input instanceof Array ? input : [input]);
}
