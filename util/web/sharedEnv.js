import { runContext } from './context.js';

/**
 * A way of sharing backend variables with the frontend that is (a) type-safe, and (b) lets both environments use the same import.
 * When called by the server, the values are calculated and written to a JSON file at the given path.
 * When called by the browser, that JSON file is `fetch`ed.
 * This means:
 * - `sharedEnv` has to be called at least once by the server before it can be called by the browser, in order for the JSON file to exist
 * - The given `fileBase` has to be servable to the front-end, and it's up to the developer to serve it
 * @template Value
 * @param {string} fileBase - The basename of the JSON file where the variables will be stored, e.g. `env`
 * @param {(existing: Value | undefined) => Promise<Value> | Value} backendSetter - A function that returns the values that will be calculated on the backend and used on the frontend.
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
		const {
			existsSync,
			readFileSync,
			writeFileSync,
		} = await import(`fs`);

		const existing = existsSync(filename)
			? /** @type {Value} */(JSON.parse(
				readFileSync(filename, { encoding: `utf8` }))
			)
			: undefined;

		const compiled = {
			...(await backendSetter(existing)),
			$filename: filename,
		};

		if (typeof compiled !== `object`) {
			throw new Error(`Value must be an object`);
		}

		writeFileSync(filename, JSON.stringify(compiled));

		return compiled;
	}
}
