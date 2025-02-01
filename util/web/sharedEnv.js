/**
 * @import fs from 'fs';
 */

import { importAs } from '../importAs';
import { runContext } from './context';

/**
 * A way of sharing backend variables with the frontend that is (a) type-safe, and (b) lets both environments use the same import.
 * @template Value
 * @param {string} fileBase - The basename of the JSON file where the variables will be stored, e.g. `env`
 * @param {() => Promise<Value> | Value} backendSetter - A function that returns the values that will be calculated on the backend and used on the frontend.
 * @returns {Promise<Value & { $filename: string }>}
 * @example
 * // env.ts
 * export const env = sharedEnv(`myEnv`, { sha: execSync(`git rev-parse --short HEAD`) });
 * // app.js
 * import { env } from `env.js`;
 * console.log(env.sha);
 */
export async function sharedEnv(fileBase, backendSetter) {
	let filename = fileBase;
	if (filename.endsWith(`.json`) === false) {
		filename += `.json`;
	}

	if (runContext === `browser`) {
		if (filename.startsWith(`/`) === false) {
			filename = `/${filename}`;
		}

		const compiled = {
			...(/** @type {Value} */(await (await fetch(filename)).json())),
			$filename: filename,
		};

		return compiled;

	} else {
		const { writeFileSync } = /** @type {fs} */(await importAs(`fs`));

		const compiled = {
			...(/** @type {Value} */(await backendSetter())),
			$filename: filename,
		};

		if (typeof compiled !== `object`) {
			throw new Error(`Value must be an object`);
		}

		writeFileSync(filename, JSON.stringify(compiled));

		return compiled;
	}
}
