export { css } from '../string/template.js';

import { mapObject } from '../group/mapObject.js';

import { CssBlock, CssMap } from './cssMap.js';

import { CssUnit } from './cssUnit.js';

export { CssBlock, CssUnit };

/**
 * @typedef {Record<string, number | string>} CssDeclarations
 */

/**
 * @typedef {Record<PropertyKey, CssUnit | number>} CssBreakpointsSource
 */

/**
 * A map of breakpoints that can be used in `@media` queries.
 * @template {CssBreakpointsSource} Source
 */
export class CssBreakpoints {
	/**
	 * @template {CssBreakpointsSource} Source
	 * @param {Source} source
	 * @returns {CssBreakpoints<Source> & Source}
	 */
	static from(source) {
		return Object.assign(new this(), source);
	}

	/**
	 * @param {keyof Source} breakpointName
	 * @returns {string}
	 */
	lessThan(breakpointName) {
		const breakpoint = this[/** @type {keyof this} */(breakpointName)];
		return `(width < ${breakpoint})`;
	}

	/**
	 * Usually I write two media queries: one for smaller than a breakpoint and one for larger. I always forget to include the breakpoint itself in one of the queries. This way I can just write `lessThan` and `moreThan` without having to remember which is inclusive.
	 * @param {keyof Source} breakpointName
	 * @returns {string}
	 */
	moreThan(breakpointName) {
		const breakpoint = this[/** @type {keyof this} */(breakpointName)];
		return `(width >= ${breakpoint})`;
	}
}

export class CssFontface extends CssMap {
	/**
	 * @param {Partial<CssFontface>} source
	 * @returns {CssFontface}
	 */
	static from(source) {
		return Object.assign(new this(), source);
	}

	/**
	 * @type {undefined | 'auto' | 'block' | 'fallback' | 'optional' | 'swap'}
	 */
	display;

	/**
	 * @type {undefined | string}
	 */

	family;

	/**
	 * @type {undefined | string}
	 */
	src;

	/**
	 * @type {undefined | 'italic' | 'normal' | 'oblique'}
	 */
	style;

	/**
	 * @type {undefined | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900}
	 */
	weight;

	/**
	 * @override
	 * @returns {string}
	 */
	toString() {
		return CssMap.toBlock({
			'font-display': this.display,
			'font-family': this.family,
			'font-style': this.style,
			'font-weight': this.weight,
			'src': (this.src ?? ``).length > 0 ? `url('${this.src}')` : ``,
		});
	}
}

/**
 * @typedef {Record<string, Partial<CssFontface>>} CssFontfacesSource
 */

/**
 * A map of CSS fontface definitions.
 * `.toString()` returns a block of CSS `@fontface` declarations.
 */
export class CssFontfaces extends CssMap {
	/**
	 * @template {CssFontfacesSource} Source
	 * @param {Source} source
	 * @returns {CssFontfaces & Record<keyof Source, CssFontface>}
	 */
	static from(source) {
		const fontfaces = mapObject(source, (fontfaceName, fontface) => [
			fontfaceName,
			CssFontface.from({
				family: fontfaceName,
				...fontface,
			}),
		]);
		return Object.assign(new this(), fontfaces);
	}

	/**
	 * @override
	 * @param {keyof this} fontfaceName
	 * @param {this[keyof this]} fontface
	 */
	toStringEach(fontfaceName, fontface) {
		return /*css*/`@font-face {
${fontface}
}`;
	}
}

export class CssTypeface extends CssMap {
	/**
	 * @template {CssDeclarations} Source
	 * @param {Source} source
	 * @returns {CssTypeface & Source}
	 */
	static from(source) {
		return Object.assign(new this(), source);
	}

	name = ``;

	// TODO1: Add size unit?

	/**
	 * @override
	 * @returns {string}
	 */
	toString() {
		const { name, ...properties } = this;
		return CssMap.toBlock({
			...properties,
			'--typeface-name': this.name,
		});
	}
}

/**
 * @typedef {Record<string, CssDeclarations>} CssTypefacesSource
 */

/**
 * A map of the styles for this theme's typefaces.
 * `toString` returns a block of CSS classes, one for each typeface.
 * Each includes a `--varName` CSS variable, so that when a typeface is used as a mixin the name of the original type can be found for referencein the compiled code.
 */
export class CssTypefaces extends CssMap {
	/**
	 * @template {CssTypefacesSource} Source
	 * @param {Source} source
	 * @returns {CssTypefaces & Record<keyof Source, CssTypeface>}
	 */
	static from(source) {
		const typefaces = mapObject(source, (typefaceName, typeface) => [
			typefaceName,
			CssTypeface.from({
				name: `type-${String(typefaceName)}`,
				...typeface,
			}),
		]);
		return Object.assign(new this(), typefaces);
	}

	/**
	 * @override
	 * @param {keyof this} key
	 * @param {this[keyof this]} value
	 */
	toStringEach(key, value) {
		const typeface = /** @type {CssTypeface} */(value);
		return `.${typeface.name} {
${typeface}
}`;
	}
}

/**
 * @template Value
 */
export class CssVariable {
	/**
	 * @template Value
	 * @param {PropertyKey} name
	 * @param {Value} value
	 * @returns {CssVariable<Value>}
	 */
	static from(name, value) {
		return new this(name, value);
	}

	/**
	 * @type {PropertyKey}
	 */
	name;

	/**
	 * @type {Value}
	 */
	value;

	get varName() {
		return `--${String(this.name)}`;
	}

	/**
	 * @param {PropertyKey} name
	 * @param {Value} value
	 */
	constructor(name, value) {
		this.name = name;
		this.value = value;
	}

	toDeclaration() {
		return `${this.varName}: ${this.value};`;
	}

	toString() {
		return `var(${this.varName})`;
	}
}

/**
 * @typedef {Record<PropertyKey, number | string>} CssVariablesSource
 */

/**
 * A map of the constant values passed into this theme, to be used as CSS variables.
 * `toString` returns a block of CSS variable declarations.
 */
export class CssVariables extends CssMap {
	/**
	 * @template {CssVariablesSource} Source
	 * @param {Source} source
	 * @returns {CssVariables & {[Key in keyof Source]: CssVariable<Source[Key]>}}
	 */
	static from(source) {
		return Object.assign(
			new this(),
			/** @type {{[Key in keyof Source]: CssVariable<Source[Key]>}} */(
				mapObject(source, (key, value) => [key, CssVariable.from(key, value)])
			),
		);
	}

	/**
	 * @override
	 * @param {keyof this} variableKey
	 * @param {CssVariable<any>} variable
	 */
	toStringEach(variableKey, variable) {
		return variable.toDeclaration();
	}
}

/**
 * A CSS snippet that resets most of the browser's default styles
 */
export const cssReset = `
background: transparent;
border: 0;
border-collapse: collapse;
border-spacing: 0;
color: inherit;
font-family: inherit;
font-size: inherit;
font-style: inherit;
font-weight: inherit;
list-style: none;
margin: 0;
padding: 0;
text-decoration: inherit;
`;
