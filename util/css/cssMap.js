/**
 * A wrapper around a map of CSS declarations, with a `.toString` that converts it to a CSS-style string
 */
export class CssMap {
	/**
	 * @param {object} source
	 * @param {typeof CssMap.toDeclaration} toStringEach
	 * @returns {string}
	 */
	static toBlock(source, toStringEach = CssMap.toDeclaration) {
		return Object.keys(source).sort().flatMap(key => {
			const value = source[/** @type {keyof typeof source} */(key)];
			return toStringEach(key, value) || [];
		}).join(`\n`);
	}

	/**
	 * @param {PropertyKey} key
	 * @param {unknown} value
	 * @returns {string}
	 */
	static toDeclaration(key, value) {
		if (
			typeof key !== `string`
			|| key.length === 0
			|| value === undefined
			|| value === null
			|| value === ``
		) {
			return ``;
		}
		return `${String(key)}: ${value};`; // eslint-disable-line @typescript-eslint/no-base-to-string
	}

	toString() {
		return CssMap.toBlock(this, this.toStringEach.bind(this));
	}

	/**
	 * @param {keyof this} key
	 * @param {this[keyof this]} value
	 * @returns {string}
	 */
	toStringEach(key, value) {
		return CssMap.toDeclaration(key, value);
	}
}

/**
 * TODO1
 */
export class CssBlock extends CssMap {
	/**
	 * @template Source
	 * @param {Source} source
	 * @returns {CssMap & Source}
	 */
	static from(source) {
		return Object.assign(new this(), source);
	}
}
