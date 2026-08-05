// TODO1: Alphabetize
export type ConstructorOf<Type> = {
	prototype: Type;
	new(...args: any): Type; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/**
 * Replacement for `Parameters`, which doesn't seem to work in `.js` files unless a `@param` has been explicitly documented (https://github.com/microsoft/TypeScript/issues/61172)
 * TODO3: Add more args, if we really need it
 */
export type Params<Fun extends (...args: any) => any> = // eslint-disable-line @typescript-eslint/no-explicit-any
	Fun extends (arg0: infer Arg0) => any // eslint-disable-line @typescript-eslint/no-explicit-any
	? Arg0
	: Fun extends (arg0: infer Arg0, arg1: infer Arg1) => any // eslint-disable-line @typescript-eslint/no-explicit-any
	? [Arg0, Arg1]
	: Fun extends (arg0: infer Arg0, arg1: infer Arg1, arg2: infer Arg2) => any // eslint-disable-line @typescript-eslint/no-explicit-any
	? [Arg0, Arg1, Arg2]
	: Fun extends (arg0: infer Arg0, arg1: infer Arg1, arg2: infer Arg2, arg3: infer Arg3) => any // eslint-disable-line @typescript-eslint/no-explicit-any
	? [Arg0, Arg1, Arg2, Arg3]
	: never;

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

export type IsAsync<Result> = () => (Result extends Promise<unknown> ? Result : never);

export type IsAsync_Not<Result> = () => (Result extends Promise<unknown> ? never : Result);

export type OneOrMany<Type> = Array<Type> | Type;

export type PromiseMaybe<Type> = Promise<Type> | Type;

export type PropertyOf<Type> = Type[keyof Type]; // Necessary for JSDoc: https://github.com/gajus/eslint-plugin-jsdoc/issues/1357

export type RequireOnly<_Object, _RequiredKeys extends keyof _Object> = Partial<_Object>
	& Pick<_Object, _RequiredKeys>;

export type Textish = URL | boolean | number | string | symbol | null | undefined;

export type Timeout = ReturnType<typeof setTimeout>;

export type ValueOf<Target> = Target[keyof Target];
