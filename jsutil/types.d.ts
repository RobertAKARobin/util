export type Constructor<Type> = {
	new(...args: Array<unknown>): Type;
};

export type OneOrMany<Type> = Type | Array<Type>;

export type Nested<Type> = Array<Type | Nested<Type>>;

export type PromiseMaybe<Type> = Type | Promise<Type>;

export type RequireOnly<_Object, _RequiredKeys extends keyof _Object> = Partial<_Object>
	& Pick<_Object, _RequiredKeys>;

export type OmitParam1<InputFunction> =
	InputFunction extends (param1: any, ...rest: infer Rest) => any // eslint-disable-line @typescript-eslint/no-explicit-any
		? Rest
		: never;

export type Param1<InputFunction> =
	InputFunction extends (param1: infer Param, ...rest: any) => any // eslint-disable-line @typescript-eslint/no-explicit-any
		? Param
		: never;

export type Timer = ReturnType<typeof setTimeout>;
