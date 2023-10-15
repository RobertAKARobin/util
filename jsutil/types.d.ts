export type Constructor<Type> = {
	new(...args: Array<unknown>): Type;
};

export type OneOrMany<Type> = Type | Array<Type>;

export type Nested<Type> = Array<Type | Nested<Type>>;

export type PromiseMaybe<Type> = Type | Promise<Type>;

export type RequireOnly<_Object, _RequiredKeys extends keyof _Object> = Partial<_Object>
	& Pick<_Object, _RequiredKeys>;

export type Timer = ReturnType<typeof setTimeout>;
