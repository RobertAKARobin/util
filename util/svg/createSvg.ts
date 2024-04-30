/**
 * Type-safe wrapper around document.createElementNS for SVGs
 */
export function createSvg<
	TagName extends keyof SVGElementTagNameMap,
>(tagName: TagName) {
	return document.createElementNS(`http://www.w3.org/2000/svg`, tagName);
}
