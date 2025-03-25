/**
 * @param {Array<string>} origin
 * @param {Array<string>} update
 * @returns {{length: number; originIndex: number; updateIndex: number;}}
 */
export function findOverlap(origin, update) {
	const result = {
		length: 0,
		originIndex: -1,
		updateIndex: -1,
	};

	const originLength = origin.length;
	const updateLength = update.length;

	(function() {
		let originIndex = 0;
		while (originIndex < originLength) {
			const originString = origin[originIndex];

			let updateIndex = 0;
			while (updateIndex < updateLength) {
				const updateString = update[updateIndex];

				if (originString === updateString) {
					result.originIndex = originIndex;
					result.updateIndex = updateIndex;
					return;
				}

				updateIndex += 1;
			}

			originIndex += 1;
		}
	})();

	if (result.originIndex === -1) {
		return result;
	}

	result.length = (function() {
		let length = 0;

		while (true) {
			const originString = origin[result.originIndex + length];
			const updateString = update[result.updateIndex + length];

			if (
				originString === undefined
				|| updateString === undefined
				|| originString !== updateString
			) {
				return length;
			}

			length += 1;
		}
	})();

	return result;
}
