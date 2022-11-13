export type OneOrMany<Type> = Type | Array<Type>;

export type PromiseMaybe<Type> = Type | Promise<Type>;

export type RequireOnly<_Object, _RequiredKeys extends keyof _Object> = Partial<_Object>
	& Pick<_Object, _RequiredKeys>;
