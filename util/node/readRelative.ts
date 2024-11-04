import fs from 'fs';

import { pathRelative } from './pathRelative.ts';

/**
 * Returns the contents of the file at the given target that is relative to the given `import.meta.url`
 */
export function readRelative(
	importMetaUrl: string,
	target: string,
) {
	return fs.readFileSync(pathRelative(importMetaUrl, target), { encoding: `utf8` });
}
