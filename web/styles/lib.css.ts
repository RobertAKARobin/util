export class CssTheme<
	Constants extends Record<string, any> = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
> {
	/**
	 * The keys of `this.val` presented as CSS variables, e.g. `var(--foo)`;
	 * @see val
	 * @see setCssVals
	 */
	readonly css = {} as Record<keyof Constants, string>;

	readonly reset = `
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
	 * CSS helpers
	 */
	constructor(
		/**
		 * A dict/object of keys and values that are used as constants throughout this CSS Theme
		 */
		readonly val: Constants
	) {
		for (const constantName in val) {
			this.css[constantName] = `var(--${constantName})`;
		}
	}

	/**
	 * Sets all vals as CSS variables
	 * @see css
	 * @see val
	 */
	setCssVals(vals: Record<string, any> = this.val) { // eslint-disable-line @typescript-eslint/no-explicit-any
		return Object.entries(vals).map(([constant, value]) => `
			--${constant}: ${value};
		`).join(``);
	}
}
