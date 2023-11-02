import type * as Type from '../types.d.ts';

/**
 * Lazily loads a module and returns a function that accesses ones of its exports. If the export is a function, it calls the export with the provided arguments
 */
export function lazy<Module>(modulePath: string) {
	let loaded: Promise<Module>;

	async function load<
		ExportName extends keyof Module,
		Exported extends Module[ExportName] = Module[ExportName],
		Args extends (
			Exported extends Type.Function ? (Parameters<Exported> | [[]] | []) : never
		) = Exported extends Type.Function ? (Parameters<Exported> | [[]] | []) : never,
		Returns extends (
			Args extends (void | []) ? Exported :
				Exported extends Type.Function
					? Args extends []
						? Exported
						: ReturnType<Exported>
					: never
		) = (
			Args extends (void | []) ? Exported :
				Exported extends Type.Function
					? Args extends []
						? Exported
						: ReturnType<Exported>
					: never
		)
	>(
		exportName: ExportName,
		...args: Args
	): Promise<Returns> {
		if (!loaded) { // eslint-disable-line @typescript-eslint/no-misused-promises
			loaded = import(modulePath) as Promise<Module>;
		}
		const module = await loaded;
		const exported = module[exportName];
		if (typeof exported === `function` && args.length > 0) {
			return exported(...args) as Returns;
		}
		return exported as Returns;
	}

	return load;
}
