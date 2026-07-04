import path from 'path';
import url from 'url';

/**
 * Returns an absolute path from the given `import.meta.url` and the given target relative path
 * TODO1: Spec
 * @param {string} importMetaUrl
 * @param {string} target
 * @returns {string}
 */
export function pathRelative(importMetaUrl, target) {
	return path.join(path.dirname(url.fileURLToPath(importMetaUrl)), target);
}

