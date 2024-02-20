type Delimiter = string;
type DelimiterSet = {
	closer: Delimiter;
	opener: Delimiter;
};
export type Result = {
	delimiters: DelimiterSet;
	indexFrom: number;
	indexTo: number;
	inner: Array<Result | string>;
};

const escape = (input: string) => input.replace(/([-\/^$*+?.()`|[\]{}])/g, `\\$&`);

export function delimiterPairs(
	input: string,
	delimiterPairs: Array<Array<Delimiter>> = [],
): Result {
	if (typeof input !== `string`) {
		throw new Error(`delimiterPairs input must be a string; got ${typeof input}`);
	}

	const rootResult: Result = {
		delimiters: {
			closer: ``,
			opener: ``,
		},
		indexFrom: 0,
		indexTo: input.length,
		inner: [],
	};

	if (input.length === 0) {
		return rootResult;
	}

	if (delimiterPairs.length === 0) {
		rootResult.inner.push(input);
		return rootResult;
	}

	const delimiterPatterns = [] as Array<string>;
	const delimitersByOpener = {} as Record<string, DelimiterSet>;
	const delimitersByCloser = {} as Record<string, DelimiterSet>;

	for (const delimiterPair of delimiterPairs) {
		const [opener, closer] = delimiterPair;
		if (opener in delimitersByOpener) {
			throw new Error(`Opener in ${delimiterPair} is already used`);
		}
		if (closer in delimitersByCloser) {
			throw new Error(`Closer in ${delimiterPair} is already used`);
		}

		const delimiterSet: DelimiterSet = {
			closer,
			opener,
		};
		delimitersByOpener[opener] = delimiterSet;
		delimitersByCloser[closer] = delimiterSet;

		const [openerPattern, closerPattern] = delimiterPair.map(escape);
		delimiterPatterns.push(openerPattern, closerPattern);
	}

	const resultsOpen = [rootResult];

	const matcher = new RegExp(
		delimiterPatterns.map(delimiter => `(${delimiter})`).join(`|`),
		`g`,
	);

	let match: RegExpExecArray | null;
	let result: Result = rootResult;
	while (match = matcher.exec(input)) {
		const delimiter = match[0];
		const isOpener = delimiter in delimitersByOpener;
		const delimiters = isOpener
			? delimitersByOpener[delimiter]
			: delimitersByCloser[delimiter];
		const { opener } = delimiters;

		const lastOpenResult = resultsOpen[resultsOpen.length - 1];

		if (isOpener) {
			const parentResult = lastOpenResult;
			const previousSibling = parentResult.inner[parentResult.inner.length - 1];
			if (previousSibling === undefined) {

				parentResult.inner.push(
					input.slice(parentResult.indexFrom, match.index)
				);
			} else if (typeof previousSibling === `object`) {
				parentResult.inner.push(
					input.slice(
						previousSibling.indexTo + previousSibling.delimiters.closer.length,
						match.index
					)
				);
			}

			result = {
				delimiters,
				indexFrom: match.index + opener.length,
				indexTo: -1,
				inner: [],
			};
			parentResult.inner.push(result);
			resultsOpen.push(result);

		} else if (lastOpenResult.delimiters === delimiters) {
			result = lastOpenResult;
			result.indexTo = match.index;
			resultsOpen.pop();

			const lastChild = result.inner[result.inner.length - 1];
			if (typeof lastChild === `object`) {
				result.inner.push(
					input.slice(
						lastChild.indexTo + lastChild.delimiters.closer.length,
						result.indexTo
					)
				);
			} else {
				result.inner.push(
					input.slice(result.indexFrom, result.indexTo)
				);
			}
		}
	}

	const final = input.slice(rootResult.inner.length === 0
		? rootResult.indexFrom
		: result.indexTo + result.delimiters.closer.length
	);
	if (final.length > 0) {
		rootResult.inner.push(final);
	}

	return rootResult;
}
