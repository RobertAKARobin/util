import fs from 'fs';

import { pathRelative } from './pathRelative.js';

/**
 * Returns the contents of the file at the given target that is relative to the given `import.meta.url`
 * TODO2: Spec
 * @param {string} importMetaUrl
 * @param {string} target
 * @returns {string}
 */
export function readRelative(importMetaUrl, target) {
	return fs.readFileSync(pathRelative(importMetaUrl, target), { encoding: `utf8` });
}
