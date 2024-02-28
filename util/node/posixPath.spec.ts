import { test } from '../spec/index.ts';

import { posixPath } from './posixPath.ts';

const urls = {
	file: `file:///foo/bar`,
	posix: `/foo/bar`,
	windows: `c:\foo\bar`,
};

export const spec = test(`standardFilepath`, $ => {
	$.assert(x => x(posixPath(urls.windows, `win32`)) === `/foo/bar`);
	$.assert(x => x(posixPath(urls.posix)) === `/foo/bar`);
	$.assert(x => x(posixPath(urls.file)) === `/foo/bar`);
});
