export { css } from '../string/template.js';

import { mapObject } from '../group/mapObject.js';

import { CssBlock, CssMap } from './cssMap.js';

import { CssUnit } from './cssUnit.js';

export { CssBlock, CssUnit };

/**
 * @typedef {Record<string, number | string>} CssDeclarations
 */

export class CssFontface extends CssMap {
	/**
	 * @param {Partial<CssFontface>} source
	 * @returns {CssFontface}
	 */
	static from(source) {
		return Object.assign(new CssFontface(), source);
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

export class CssFontfaces extends CssMap {
	/**
	 * @template {Record<string, Partial<CssFontface>>} Source
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
		return Object.assign(new CssFontfaces(), fontfaces);
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

export class CssTypefaces extends CssMap {
	/**
	 * @template {Record<string, CssDeclarations>} Source
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
		return Object.assign(new CssTypefaces(), typefaces);
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
 * @typedef {Record<string, number>} GenericBreakpoints
 * @typedef {Record<string, number | string>} GenericConstants
 * @typedef {Record<string, string>} GenericTypefaces
 */

export const reset = `
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

/**
 * Produces a bunch of useful CSS helpers, given the constants that underly your application's styling
 * @template {GenericBreakpoints} Breakpoints
 * @template {GenericConstants} Constants
 * @template {Record<string, Partial<CssFontface>>} Fonts
 * @template {GenericTypefaces} Typefaces
 */
export class CssTheme {
	/**
	 * A map of CSS breakpoints to strings that can be used in `@media` queries, e.g. `bp.lessThan.phone` translates to `(max-width: ${phone}px)`
	 * @readonly
	 */
	bp = {
		lessThan: /** @type {Record<keyof Breakpoints, string>} */({}),
		moreThan: /** @type {Record<keyof Breakpoints, string>} */({}),
	};
	/**
	 * A CSS snippet that resets most of the browser's default styles
	 * @returns {string}
	 */
	get reset() {
		return reset;
	}
	/**
	 * The styles for this themes's typefaces as CSS classes, e.g. `{ subtitle: 'font-size: 3rem;' }` becomes `.type-subtitle { font-size: 3rem; }`
	 * @type {string}
	 * @readonly
	 */
	typeClasses;
	/**
	 * The names of this theme's typefaces as CSS class names, e.g. `type-h1`;
	 * @type {Record<keyof Typefaces, string>}
	 * @readonly
	 */
	typeClassNames;
	/**
	 * A map of the styles for this theme's typefaces. Each includes a `--varName` CSS variable, so that when a typeface is used as a mixin the name of the original type can be found for referencein the compiled code.
	 * @readonly
	 */
	types = /** @type {Typefaces} */({});
	/**
	 * A map of the constant values passed into this theme
	 * @type {Constants}
	 * @readonly
	 */
	val;
	/**
	 * The keys of `this.val` written as CSS variables, e.g. `var(--foo)`;
	 * @readonly
	 */
	vars = /** @type {Record<keyof Constants, string>} */({});
	/**
	 * The contents of `this.val` as CSS variables, such as can be inserted into the `root:` of a stylesheet
	 * @type {string}
	 * @readonly
	 */
	varsDeclarations;
	/**
	 * The keys of `this.val` written as CSS variable names, e.g. `--foo`
	 * @readonly
	 */
	vname = /** @type {Record<keyof Constants, string>} */({});

	/**
	 * @param {object} [input]
	 * @param {Breakpoints} [input.bps]
	 * @param {Fonts} [input.fonts]
	 * @param {Typefaces} [input.types]
	 * @param {Constants} [input.val]
	 */
	constructor(input = {}) {
		const breakpoints = input.bps ?? /** @type {Breakpoints} */({});
		this.val = {
			...input.val ?? /** @type {Constants} */({}),
			...breakpoints,
		};
		for (const constantName in this.val) {
			const vname = `--${constantName}`;
			this.vname[constantName] = vname;
			this.vars[constantName] = `var(${vname})`;
		}
		this.varsDeclarations = this.toCssVariables(this.val);

		const typefaces = input.types ?? /** @type {Record<string, string>} */({});

		this.typeClassNames = Object.keys(typefaces).reduce((typeClassNames, typeface) => {
			const typeName = /** @type {keyof Typefaces} */(typeface);
			typeClassNames[typeName] = `type-${typeface}`;
			return typeClassNames;
		}, /** @type {Record<keyof Typefaces, string>} */({}));

		const typeClasses = [];
		for (const typeName in typefaces) {
			const typeStyles = typefaces[typeName];
			typefaces[typeName] = `
				--typeface-name: '${typeName}';
				${typeStyles}
			`;
			typeClasses.push(`
				.${this.typeClassNames[typeName]} {
					${typeStyles}
				}
			`);
		}
		this.types = /** @type {Typefaces} */(typefaces);
		this.typeClasses = typeClasses.join(`\n`);

		for (const bpName in breakpoints) {
			const bpSize = breakpoints[bpName];
			this.bp.lessThan[bpName] = `(width < ${bpSize - 1}px)`;
			this.bp.moreThan[bpName] = `(width > ${bpSize}px)`; // TODO3: Had `>=`, but jsBeautify kept removing the space after it which made stylelint fail
		}
	}

	/**
	 * Outputs a string that declares all vals as CSS variables
	 * @param {GenericConstants} vals
	 * @returns {string}
	 * @see {@link CssTheme.val}
	 * @see {@link CssTheme.vars}
	 */
	toCssVariables(vals) {
		return Object.entries(vals).map(([constant, value]) => `
			--${constant}: ${value};
		`).join(``);
	}
}
