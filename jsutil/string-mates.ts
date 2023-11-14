type Tag = string;
type TagPair = [Tag, Tag];
export type TagResult = {
	contents: Array<string | TagResult>;
	tags?: TagPair;
};

export function stringMates(
	input: string,
	tagPairs: Array<TagPair> = [],
): Array<string | TagResult> {
	if (typeof input !== `string`) {
		throw new Error(`stringMates input must be a string; got ${typeof input}`);
	}
	if (input.length === 0 || tagPairs.length === 0) {
		return [ input ];
	}

	const pairsByOpenTag = {} as Record<Tag, TagPair>;
	for (const pair of tagPairs) {
		const [openTag] = pair;
		if (openTag in pairsByOpenTag) {
			throw new Error(`Tag '${openTag}' used more than once`);
		}

		pairsByOpenTag[openTag] = pair;
	}

	return getNext(input);

	function getNext(input: string): Array<string | TagResult> {
		if (input.length === 0) {
			return [];
		}

		const nearest = {
			closePosition: -1,
			closeTag: null as unknown as Tag,
			openPosition: Infinity,
			openTag: null as unknown as Tag,
		};
		for (const openTag in pairsByOpenTag) {
			const closeTag = pairsByOpenTag[openTag][1];

			let openPosition: number = -1;
			let closePosition: number = -1;
			let depth = 0;
			let openOffset = 0;

			do {
				openPosition = input.indexOf(openTag, openOffset);
				if (openPosition < 0) {
					openPosition = Infinity;
				}

				let nextClosePosition = input.indexOf(closeTag, openOffset);
				if (nextClosePosition < 0) {
					nextClosePosition = Infinity;
				}

				if (nextClosePosition !== Infinity) {
					closePosition = nextClosePosition;
				}

				if (openPosition < nextClosePosition) {
					depth += 1;
					openOffset = openPosition + openTag.length;
				} else {
					depth -= 1;
					openOffset = closePosition + closeTag.length;
				}

				if (nextClosePosition === Infinity && openPosition === Infinity) {
					break;
				}
			} while (depth > 0);

			if (depth >= 0) {
				openPosition = input.indexOf(openTag);
				if (openPosition < nearest.openPosition) {
					nearest.openPosition = openPosition;
					nearest.openTag = openTag;
					nearest.closePosition = closePosition;
					nearest.closeTag = closeTag;
				}
			}
		}

		if (nearest.openPosition < 0 || nearest.closePosition <= 0) {
			return [ input ];
		}

		const results = [] as Array<string | TagResult>;

		const beforeContents = input.substring(0, nearest.openPosition);
		if (beforeContents.length > 0) {
			results.push(beforeContents);
		}

		const contents = input.substring(
			nearest.openPosition + nearest.openTag.length,
			nearest.closePosition,
		);
		results.push({
			contents: getNext(contents),
			tags: [nearest.openTag, nearest.closeTag],
		});

		const afterContents = input.substring(
			nearest.closePosition + nearest.closeTag.length
		);
		if (afterContents.length > 0) {
			results.push(...getNext(afterContents));
		}

		return results;
	}
}
