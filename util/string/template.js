/**
 * @import { Nested, Textish } from '../types.d';
 */

/**
 * A tagged template function that just returns the strings passed into it. Lets us use 'lit-html' syntax.
 * TODO3: Find additional uses
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates See MDN Docs}
 * @param {ReadonlyArray<string>} strings - Originally had these as <string> but that would reject numbers, URLs, etc
 * @param {Nested<Textish | { toString: () => string }>} values
 * @returns {string}
 */
export function taggedTemplate(strings, ...values) {
	let out = ``;
	for (let index = 0, length = strings.length; index < length; index += 1) {
		out += strings[index];

		const value = values[index];
		if (typeof value === `string`) {
			out += value;
		} else if (value === null || value === undefined || value === false) {
			continue;
		} else if (Array.isArray(value)) {
			out += value.join(``);
		} else {
			out += value.toString();
		}
	}
	return out;
}

/**
 * @borrows taggedTemplate as css
 * @borrows taggedTemplate as html
 */
export {
	taggedTemplate as css,
	taggedTemplate as html,
};
