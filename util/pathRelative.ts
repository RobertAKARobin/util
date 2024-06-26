import path from 'path';
import url from 'url';

/**
 * Returns an absolute path from the given `import.meta.url` and the given target relative path
 */
export function pathRelative(
	importMetaUrl: string,
	target: string,
) {
	return path.join(path.dirname(url.fileURLToPath(importMetaUrl)), target);
}

