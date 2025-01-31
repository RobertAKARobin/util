/**
 * Type-safe wrapper around document.createElementNS for SVGs
 * @template {keyof SVGElementTagNameMap} TagName
 * @param {TagName} tagName
 * @returns {SVGElementTagNameMap[TagName]}
 */
export function svgCreate(tagName) {
	return document.createElementNS(`http://www.w3.org/2000/svg`, tagName);
}
