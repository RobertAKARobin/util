/**
 * A tagged template function that just returns the strings passed into it. Lets us use 'lit-html' syntax. TODO3: Find additional uses
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates See MDN Docs}
 */
export function taggedTemplate(
	strings: ReadonlyArray<string>,
	...values: Array<string>
) {
	return strings.map((chunk, index) => `${chunk}${values[index] ?? ``}`).join(``);
}

/**
 * @borrows taggedTemplate as css
 * @borrows taggedTemplate as html
 */
export {
	taggedTemplate as css,
	taggedTemplate as html,
};
