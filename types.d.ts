export type Constructor<Type> = {
	new(...args: Array<unknown>): Type;
};

export type KeysMatching<Type, Value> = { // https://stackoverflow.com/q/77571882/2053389
	[Key in keyof Type]: Type[Key] extends Value ? Key : never
}[keyof Type];

export type OneOrMany<Type> = Type | Array<Type>;

export type Nested<Type> = Array<Type | Nested<Type>>;

export type PromiseMaybe<Type> = Type | Promise<Type>;

export type RequireOnly<_Object, _RequiredKeys extends keyof _Object> = Partial<_Object>
	& Pick<_Object, _RequiredKeys>;

export type FromIndex1<Input> =
	Input extends [param1: any, ...rest: infer Rest] // eslint-disable-line @typescript-eslint/no-explicit-any
		? Rest
		: never;

export type AtIndex1<Input> =
	Input extends [param1: infer Param, ...rest: any] // eslint-disable-line @typescript-eslint/no-explicit-any
		? Param
		: never;

export type Timer = ReturnType<typeof setTimeout>;