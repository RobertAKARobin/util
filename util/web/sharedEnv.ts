import type fs from 'fs';

import { appContext } from './context.ts';
import { importAs } from '../importAs.ts';

/**
 * A way of sharing backend variables with the frontend that is (a) type-safe, and (b) lets both environments use the same import.
 * @param fileBase The basename of the JSON file where the variables will be stored, e.g. `env`
 * @param backendSetter A function that returns the values that will be calculated on the backend and used on the frontend.
 * @example
 * // env.ts
 * export const env = sharedEnv(`myEnv`, { sha: execSync(`git rev-parse --short HEAD`) });
 * // app.js
 * import { env } from `env.js`;
 * console.log(env.sha);
 */
export async function sharedEnv<Value>(
	fileBase: string,
	backendSetter: () => Promise<Value> | Value,
): Promise<Value & {
	$filename: string;
}> {
	let filename = fileBase;
	if (filename.endsWith(`.json`) === false) {
		filename += `.json`;
	}

	if (appContext === `browser`) {
		if (filename.startsWith(`/`) === false) {
			filename = `/${filename}`;
		}

		const compiled = {
			...(await (await fetch(filename)).json()) as Value,
			$filename: filename,
		};
		return compiled;

	} else {
		const { writeFileSync } = await importAs<typeof fs>(`fs`);

		const compiled = {
			...(await backendSetter()),
			$filename: filename,
		};

		if (typeof compiled !== `object`) {
			throw new Error(`Value must be an object`);
		}

		writeFileSync(filename, JSON.stringify(compiled));

		return compiled;
	}
}
