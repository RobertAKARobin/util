/**
 * Takes a map of CSS declarations and converts it to a CSS-style string
 * @template {object} CssSource
 * @param {CssSource} source
 * @returns {string}
 */
export function cssMapToString(source) {
	let out = ``;
	for (const property of Object.keys(source).sort()) {
		const value = source[/** @type {keyof CssSource} */(property)];
		if (value === undefined || value === null) {
			continue;
		}
		out += `${property}: ${value};\n`;
	}
	return out;
}

/**
 * Takes a map of CSS declarations and overwrites its `.toString` method so it prints as valid CSS. See {@link cssMapToString}
 * @template {object} CssSource
 * @param {CssSource} source
 * @param {(source: CssSource) => string} [toString]
 * @returns {CssSource}
 */
export function cssMap(source, toString) {
	Object.defineProperties(source, {
		[Symbol.toPrimitive]: {
			enumerable: false,
			value: () => toString ? toString(source) : cssMapToString(source),
		},
	});

	return source;
}

/**
 * Returns {@link cssMap} with custom typing and/or a custom `.toString`
 * @template {object} CssSource
 * @param {CssSource} sourceDefault
 * @param {(source: CssSource) => string} [toString]
 * @returns {(source: CssSource) => CssSource}
 */
export function cssMapFactory(sourceDefault, toString) {
	return (/** @type {CssSource} */source) => {
		return cssMap({
			...sourceDefault,
			...source,
		}, toString);
	};
}
