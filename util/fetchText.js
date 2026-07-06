/**
 * @import fsType from 'fs';
 * @import pathType from 'path';
 */

import { runContext } from './web/context.js';

/**
 * Loads and returns the text at the given target path
 * TODO1: Spec for web
 * @param {string} target
 * @returns {Promise<string>}
 */
export async function fetchText(target) {
	if (runContext === `browser`) {
		const response = await fetch(target);
		const text = await response.text();
		return text;

	} else {
		const fs = await /** @type {Promise<fsType>} */(import(`${`fs`}`)); // Tricks esbuild out of bundling Node libraries
		const path = await /** @type {Promise<pathType>} */(import(`${`path`}`));

		const targetPath = path.join(process.cwd(), target);
		const text = await fs.promises.readFile(targetPath, { encoding: `utf8` });
		return text;

	}
}
