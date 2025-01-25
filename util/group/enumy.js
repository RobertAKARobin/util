/**
 * Converts an array of strings into a dict where each key/value is the same strongly-typed string. This is useful for enforcing the use of specific strings.
 * The TS enum `{ foo, bar }` will compile to `{ "foo": 0, "bar": 1 }`. Enums are a way to enforce using certain values, but if the value should also be a string then you have to write `{ foo = "foo"; bar = "bar"; }`. `enumy` keeps it DRY by compiling `['foo', 'bar']` to `{ "foo": "foo", "bar": "bar" }`.
 * @template {string} Key
 * @param {Array<Key>} input
 * @returns {{ [Key in input[number]]: Key }}
 */
export function enumy(...input) {
	const output = /** @type {{ [Key in input[number]]: Key }} */({});
	for (const key of input) {
		output[key] = key;
	}
	return output;
}
