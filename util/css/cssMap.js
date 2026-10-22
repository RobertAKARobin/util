/**
 * Takes a map of CSS declarations and converts it to a CSS-style string
 * @template {object} CssSource
 * @param {CssSource} source
 * @returns {string}
 */
export function cssMapToString(source) {
	return Object.keys(source).sort().flatMap(property => {
		const value = source[/** @type {keyof CssSource} */(property)];
		if (value === undefined || value === null) {
			return [];
		}
		return `${property}: ${value};`;
	}).join(`\n`);
}

/**
 * A wrapper around a map of CSS declarations, with a `.toString` that converts it to a CSS-style string
 * @template {object} Source
 */
export class CssMap {
	get $() {
		return this.source;
	}

	source = /** @type {Source} */({}); // Wanted to just use a plain object and overwrite its `toString` with `Object.defineProperties`, but that felt too hacky

	/**
	 * @param {Source} source
	 */
	constructor(source) {
		this.source = source;
	}

	toString() {
		return cssMapToString(this.source);
	}
}
