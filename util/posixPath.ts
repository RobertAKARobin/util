import path from 'path';

import { escape } from './escape.ts';

export function posixPath(
	input: string,
	originPlatform?: `posix` | `win32`
): string {
	const localeSeparator = (originPlatform ?? process.platform) === `win32`
		? `\\`
		: path.posix.sep;
	const fileUrl = escape(input)
		.split(localeSeparator)
		.join(path.posix.sep);
	try {
		return new URL(fileUrl).pathname;
	} catch (e) {
		return fileUrl;
	}
}
