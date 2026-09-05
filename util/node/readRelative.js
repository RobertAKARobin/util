import fs from 'fs';

import { pathRelative } from './pathRelative.js';

/**
 * Returns the contents of the file at the given target that is relative to the given `import.meta.url`
 * @param {string} importMetaUrl
 * @param {string} [target]
 * @returns {string}
 */
export function readRelative(importMetaUrl, target) {
	const path = target === undefined
		? importMetaUrl
		: pathRelative(importMetaUrl, target);

	return fs.readFileSync(path, { encoding: `utf8` });
}
