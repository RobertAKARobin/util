/**
 * A wrapper around `import` to trick esbuild into not recognizing a dynamic import.
 * @example
 * import type fs from 'fs';
 * const { readFileSync } = await importAs<typeof fs>(`fs`);
 */
export async function importAs<Type>(filename: string) {
	return await import(filename) as Type;
}
