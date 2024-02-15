type Delimiter = string;
type DelimiterPair = Array<string>; // Not using `[string, string]` because TS throws "not assignable" error
export type Result = {
	delimiters: DelimiterPair;
	indexFrom: number;
	indexTo: number;
	inner: Array<string | Result>;
};

export function delimiterPairs(
	input: string,
	delimiterPairs: Array<DelimiterPair> = [],
): Result {
	if (typeof input !== `string`) {
		throw new Error(`delimiterPairs input must be a string; got ${typeof input}`);
	}

	const rootResult: Result = {
		delimiters: [],
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

	const delimiterPairsByOpener = {} as Record<Delimiter, DelimiterPair>;
	for (const delimiterPair of delimiterPairs) {
		const [opener] = delimiterPair;
		if (opener in delimiterPairsByOpener) {
			throw new Error(`Opener '${opener}' is already used`);
		}

		delimiterPairsByOpener[opener] = delimiterPair;
	}

	const resultsOpen = [rootResult];

	const matcher = new RegExp(
		delimiterPairs.flat().map(delimiter => `(${delimiter})`).join(`|`),
		`g`,
	);

	let match: RegExpExecArray | null;
	let result: Result = rootResult;
	while (match = matcher.exec(input)) {
		const [delimiter] = match;
		const delimiterIndex = match.slice(1).findIndex(pattern => pattern === delimiter);
		const delimiterPairIndex = Math.floor(delimiterIndex / 2);
		const delimiterPair = delimiterPairs[delimiterPairIndex];
		const isOpener = delimiterIndex % 2 === 0;
		// const opener = isOpener ? delimiter : delimiterPair[0];
		const closer = isOpener ? delimiterPair[1] : delimiter;

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
					input.slice(previousSibling.indexTo, match.index)
				);
			}

			result = {
				delimiters: delimiterPair,
				indexFrom: match.index,
				indexTo: -1,
				inner: [],
			};
			parentResult.inner.push(result);
			resultsOpen.push(result);

		} else if(lastOpenResult.delimiters === delimiterPair) {
			result = lastOpenResult;
			result.indexTo = match.index + closer.length;
			resultsOpen.pop();

			const lastChild = result.inner[result.inner.length - 1];
			if (typeof lastChild === `object`) {
				result.inner.push(
					input.slice(lastChild.indexTo, result.indexTo)
				);
			} else {
				result.inner.push(
					input.slice(result.indexFrom, result.indexTo)
				);
			}
		}
	}

	for (const result of resultsOpen) {
		if (result.indexTo === -1) {
			throw new Error(`Detected an unclosed '${result.delimiters[0]}' at ${result.indexFrom}`);
		}
	}

	const final = input.slice(rootResult.inner.length === 0
		? rootResult.indexFrom
		: result.indexTo
	);
	if (final.length > 0) {
		rootResult.inner.push(final);
	}

	return rootResult;
}
