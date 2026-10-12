import { mapObject } from '../group/mapObject.js';

export { css } from '../string/template.js';

/**
 * @typedef {Record<string, number>} CssThemeSourceBreakpoints
 */

/**
 * @typedef {Record<string, number | string>} CssThemeSourceConstants
 */

/**
 * @typedef {{
 * display?: 'auto' | 'block' | 'fallback' | 'optional' | 'swap';
 * name?: string;
 * src?: string;
 * style?: 'italic' | 'normal' | 'oblique';
 * weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
 * }} CssThemeSourceFont
 */

/**
 * @typedef {Record<string, CssThemeSourceFont>} CssThemeSourceFonts
 */

/**
 * @typedef {Record<string, string>} CssThemeSourceTypefaces
 */

/**
 * @template {CssThemeSourceBreakpoints} Breakpoints
 * @template {CssThemeSourceConstants} Constants
 * @template {CssThemeSourceFonts} Fonts
 * @template {CssThemeSourceTypefaces} Typefaces
 * @typedef {object} CssThemeSource
 * @property {Breakpoints} [bps] - TODO1
 * @property {Fonts} [fonts] - TODO1
 * @property {Typefaces} [types] - TODO1
 * @property {Constants} [val] - TODO1
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

export class CssThemeFont {
	/** @type {CssThemeSourceFont['display']} */
	display;

	/** @type {CssThemeSourceFont['name']} */
	name;

	/** @type {CssThemeSourceFont['src']} */
	src;

	/** @type {CssThemeSourceFont['style']} */
	style;

	/** @type {CssThemeSourceFont['weight']} */
	weight;

	/**
	 * @param {CssThemeSourceFont} source
	 */
	constructor(source) {
		Object.assign(this, source);
	}

	toFontFace() {
		return /*css*/`@font-face {
${this.display ? `font-display: ${this};` : ``}
${typeof this.name === `string` ? `font-family: ${String(this.name)};` : ``}
${this.style ? `font-style: ${this.style};` : ``}
${this.weight ? `font-weight: ${this.weight ?? 400};` : ``}
${typeof this.src === `string` ? `src: url('${this.src}');` : ``}
}`;
	}
}

/**
 * Produces a bunch of useful CSS helpers, given the constants that underly your application's styling
 * @template {CssThemeSourceBreakpoints} Breakpoints
 * @template {CssThemeSourceConstants} Constants
 * @template {CssThemeSourceFonts} Fonts
 * @template {CssThemeSourceTypefaces} Typefaces
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
	 * @type {CssThemeSource<Breakpoints, Constants, Fonts, Typefaces>}
	 */
	source = {};
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
	 * @param {CssThemeSource<Breakpoints, Constants, Fonts, Typefaces>} [input]
	 */
	constructor(input = {}) {
		this.source.fonts = input.fonts ?? /** @type {Fonts} */({});

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
	 * TODO1
	 * @returns {Record<keyof Fonts, CssThemeFont>}
	 */
	fonts() {
		if (typeof this.source.fonts === `undefined`) {
			return /** @type {Record<keyof Fonts, CssThemeFont>} */({});
		}

		return mapObject(this.source.fonts, (fontName, source) => [
			fontName,
			new CssThemeFont(source),
		]);
	}

	/**
	 * Outputs a string that declares all vals as CSS variables
	 * @param {CssThemeSourceConstants} vals
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
