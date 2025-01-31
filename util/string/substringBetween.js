/**
 * Given a two patterns and an input string, return the substring that comes between the patterns' matches
 * @param {string} subject
 * @param {object} [options]
 * @param {RegExp} [options.begin=/^/]
 * @param {RegExp} [options.end=/$/]
 * @returns {null | string}
 */
export function substringBetween(subject, options = {}) {
	const matcherBegin = options.begin ?? /^/;
	const matcherEnd = options.end ?? /$/;

	if (matcherBegin.global || matcherEnd.global) {
		throw new TypeError(`Don't use the global flag with substringBetween`);
	}

	const begin = subject.match(matcherBegin);
	if (begin === null) {
		return null;
	}

	const end = subject.match(matcherEnd);
	if (end === null) {
		return null;
	}

	return subject.substring(/** @type {number} */(begin.index) + begin[0].length, end.index);
}
