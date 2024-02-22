import type * as Type from './types.d.ts';

export function toArray<Value>(input: Type.OneOrMany<Value>): Array<Value> {
	return (input instanceof Array ? input : [input]);
}
