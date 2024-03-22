/**
 * Removes the character at the specified position, including going forward or backward the specified length
 */
export function deleteAt(
	text: string,
	position: number | null = null,
	length: number = 0
) {
	const positionStart = (position ?? text.length - 1) + (length < 0 ? length : 0);
	const positionEnd = positionStart + 1 + Math.abs(length);
	const before = text.slice(0, positionStart);
	const after = text.slice(positionEnd);
	return `${before}${after}`;
}
