/**
 * @template [Value=string]
 * @param {Value} origin
 * @param {Value} update
 * @returns {boolean}
 */
function compareDefault(origin, update) {
	return (
		origin !== undefined
		&& update !== undefined
		&& origin === update
	);
}

/**
 * Given two arrays, find the portions of those arrays that overlap
 * @template [Value=string]
 * @param {Array<Value>} origin
 * @param {Array<Value>} update
 * @param {object} [options]
 * @param {(origin: Value, update: Value) => boolean} [options.compare]
 * @returns {{length: number; originIndex: number; updateIndex: number;}}
 */
export function findOverlap(origin, update, options = {}) {
	const result = {
		length: 0,
		originIndex: -1,
		updateIndex: -1,
	};

	const compare = options.compare ?? compareDefault;

	const originLength = origin.length;
	const updateLength = update.length;

	(function() {
		let originIndex = 0;
		while (originIndex < originLength) {
			const originItem = origin[originIndex];

			let updateIndex = 0;
			while (updateIndex < updateLength) {
				const updateItem = update[updateIndex];

				if (compare(originItem, updateItem)) {
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
			const originItem = origin[result.originIndex + length];
			const updateItem = update[result.updateIndex + length];

			if (compare(originItem, updateItem) === false) {
				return length;
			}

			length += 1;
		}
	})();

	return result;
}
