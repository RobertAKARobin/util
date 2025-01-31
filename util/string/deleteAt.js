/**
 * Removes the character at the specified position, including going forward or backward the specified length
 * @param {string} text
 * @param {number | null} [position=null]
 * @param {number} [length=0]
 * @returns {string}
 */
export function deleteAt(text, position = null, length = 0) {
	const positionStart = (position ?? text.length - 1) + (length < 0 ? length : 0);
	const positionEnd = positionStart + 1 + Math.abs(length);
	const before = text.slice(0, positionStart);
	const after = text.slice(positionEnd);
	return `${before}${after}`;
}
