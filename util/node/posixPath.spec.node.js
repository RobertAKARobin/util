import { test } from '../spec/index.js';

import { posixPath } from './posixPath.js';

const urls = {
	file: `file:///foo/bar`,
	posix: `/foo/bar`,
	windows: `c:\foo\bar`,
};

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(posixPath(urls.windows, `win32`)) === `/foo/bar`);
	$.assert(x => x(posixPath(urls.posix)) === `/foo/bar`);
	$.assert(x => x(posixPath(urls.file)) === `/foo/bar`);
});
