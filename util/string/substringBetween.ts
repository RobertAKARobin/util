export function substringBetween(subject: string, options: {
	begin?: RegExp;
	end?: RegExp;
} = {}) {
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

	return subject.substring(begin.index! + begin[0].length, end.index);
}
