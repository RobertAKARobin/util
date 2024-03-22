export type Constructor<Type> = {
	new(...args: Array<unknown>): Type;
};

export type KeysMatching<Type, Value> = { // https://stackoverflow.com/q/77571882/2053389
	[Key in keyof Type]: Type[Key] extends Value ? Key : never
}[keyof Type];

export type Index1<Input> =
	Input extends [param1: infer Param, ...rest: any] // eslint-disable-line @typescript-eslint/no-explicit-any
		? Param
		: never;

export type Index1Forward<Input> =
	Input extends [param1: any, ...rest: infer Rest] // eslint-disable-line @typescript-eslint/no-explicit-any
		? Rest
		: never;

export type Nested<Type> = Array<Nested<Type> | Type>;

export type OneOrMany<Type> = Array<Type> | Type;

export type PromiseMaybe<Type> = Promise<Type> | Type;

export type RequireOnly<_Object, _RequiredKeys extends keyof _Object> = Partial<_Object>
	& Pick<_Object, _RequiredKeys>;

export type Textish = URL | boolean | number | string | symbol | null | undefined;

export type Timer = ReturnType<typeof setTimeout>;

export type ValueOf<Target> = Target[keyof Target];
