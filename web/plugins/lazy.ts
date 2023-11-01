import type * as Type from '../types.d.ts';

export const lazy = async<
	ModuleShape,
	ExportedName extends keyof ModuleShape = keyof ModuleShape,
	Exported extends ModuleShape[ExportedName] = ModuleShape[ExportedName],
	Args extends (
		Exported extends Type.Function ? Parameters<Exported> : []
	) = Exported extends Type.Function ? Parameters<Exported> : [],
	Returns extends (
		Exported extends Type.Function ? ReturnType<Exported> : Exported
	) = Exported extends Type.Function ? ReturnType<Exported> : Exported
>(
	modulePath: string,
	exportName: ExportedName,
	...args: Args
): Promise<Returns> => {
	const module = await import(modulePath) as ModuleShape;
	const exported = module[exportName] as Exported;
	if (typeof exported === `function`) {
		return exported(...args) as Returns;
	}
	return exported as unknown as Returns;
};
