import path from 'path';

import { escape } from '../string/escape';

/**
 * Returns the given path as a Posix-compatible path. Currently useful pretty much just for converting Windows paths
 * @param {string} input
 * @param {'posix' | 'win32' | undefined} originPlatform
 * @returns {string}
 */
export function posixPath(input, originPlatform = undefined) {
	const localeSeparator = (originPlatform ?? process.platform) === `win32`
		? `\\`
		: path.posix.sep;
	const fileUrl = escape(input)
		.split(localeSeparator)
		.join(path.posix.sep);
	try {
		return new URL(fileUrl).pathname;
	} catch (_e) {
		return fileUrl;
	}
}
