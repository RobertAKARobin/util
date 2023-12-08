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

type GenericBreakpoints = Record<string, number>;
type GenericConstants = Record<string, string | number>;
type GenericTypefaces = Record<string, string>;

/**
 * Produces a bunch of useful CSS helpers, given the constants that underly your application's styling
 */
export class CssTheme<
	Breakpoints extends GenericBreakpoints = GenericBreakpoints,
	Constants extends GenericConstants = GenericConstants,
	Typefaces extends GenericTypefaces = GenericTypefaces,
> {
	/**
	 * A map of CSS breakpoints to strings that can be used in `@media` queries, e.g. `bp.lessThan.phone` translates to `(max-width: ${phone}px)`
	 */
	readonly bp = {
		lessThan: {} as Record<keyof Breakpoints, string>,
		moreThan: {} as Record<keyof Breakpoints, string>,
	};
	/**
	 * A CSS snippet that resets most of the browser's default styles
	 */
	readonly reset = reset;
	/**
	 * The styles for this themes's typefaces as CSS classes, e.g. `{ subtitle: 'font-size: 3rem;' }` becomes `.type-subtitle { font-size: 3rem; }`
	 */
	readonly typeClasses: string;
	/**
	 * The names of this theme's typefaces as CSS class names, e.g. `type-h1`;
	 */
	readonly typeClassNames: Record<keyof Typefaces, string>;
	/**
	 * A map of the styles for this theme's typefaces. Each includes a `--varName` CSS variable, so that when a typeface is used as a mixin the name of the original type can be found for referencein the compiled code.
	 */
	readonly types = {} as Typefaces;
	/**
	 * A map of the constant values passed into this theme
	 */
	readonly val: Constants;
	/**
	 * The keys of `this.val` written as CSS variables, e.g. `var(--foo)`;
	 */
	readonly vars = {} as Record<keyof Constants, string>;
	/**
	 * The contents of `this.val` as CSS variables, such as can be inserted into the `root:` of a stylesheet
	 */
	readonly varsDeclarations: string;
	/**
	 * The keys of `this.val` written as CSS variable names, e.g. `--foo`
	 */
	readonly vname = {} as Record<keyof Constants, string>;

	constructor(input: Partial<{
		bps: Breakpoints;
		types: Typefaces;
		val: Constants;
	}> = {}) {
		const breakpoints = input.bps || {} as Breakpoints;
		this.val = {
			...input.val || {} as Constants,
			...breakpoints,
		};
		for (const constantName in this.val) {
			const vname = `--${constantName}`;
			this.vname[constantName] = vname;
			this.vars[constantName] = `var(${vname})`;
		}
		this.varsDeclarations = this.toCssVariables(this.val);

		const typefaces = input.types || {} as Record<string, string>;

		const typeNames = Object.keys(typefaces);
		this.typeClassNames = typeNames.reduce((typeNames, typeName: keyof Typefaces) => {
			typeNames[typeName] = `type-${typeName as string}`;;
			return typeNames;
		}, {} as Record<keyof Typefaces, string>);

		const typeClasses = [] as Array<string>;
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
		this.types = typefaces as Typefaces;
		this.typeClasses = typeClasses.join(`\n`);

		for (const bpName in breakpoints) {
			const bpSize = breakpoints[bpName];
			this.bp.lessThan[bpName] = `(width < ${bpSize - 1}px)`;
			this.bp.moreThan[bpName] = `(width > ${bpSize}px)`; // TODO3: Had `>=`, but jsBeautify kept removing the space after it which made stylelint fail
		}
	}

	/**
	 * Outputs a string that declares all vals as CSS variables
	 * @see css
	 * @see val
	 */
	toCssVariables(vals: GenericConstants) {
		return Object.entries(vals).map(([constant, value]) => `
			--${constant}: ${value};
		`).join(``);
	}
}
