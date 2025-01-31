/**
 * @import { Textish } from '../types.d';
 * @import { ElAttributes } from './types.d';
 */

/**
 * Returns true if value is undefined, null, or the literal strings `undefined` or `null`
 * @param {unknown} value
 * @returns {boolean}
 */
export function attributeValueIsEmpty(value) {
	return (
		value === undefined
		|| value === null
		|| value === `undefined`
		|| value === `null`
	);
}

/**
 * Returns attributes of the element as a dict
 * @template {Element} Target
 * @param {Target} target
 * @returns {Partial<ElAttributes<Target>>}
 */
export function getAttributes(target) {
	const attributes = /** @type {Record<string, string>} */({});
	for (const attribute of target.attributes) {
		attributes[attribute.name] = attribute.value;
	}
	return /** @type {Partial<ElAttributes<Target>>} */(attributes);
}

/**
 * Calls `.setAttribute` on the target for each of the given properties. Calls `.removeAttribute` if given value is empty; see {@link attributeValueIsEmpty}.
 * @template {Element} Target
 * @param {Target} target
 * @param {Element | Partial<ElAttributes<Target>>} source
 * @param {object} [options]
 * @param {boolean} [options.attrsOnly=false]
 * @returns {Target}
 */
export function setAttributes(
	target,
	source,
	options = {},
) {
	const updates = {
		...(source instanceof Element ? getAttributes(source) : source),
	};
	for (const attributeName in updates) {
		const attributeKey = /** @type {keyof Target} */(attributeName);
		const value = updates[/** @type {keyof Element} */(attributeName)];
		if (attributeKey in target && options.attrsOnly !== true) { // Try using a regular setter first, e.g. `target[propertyName]`. Useful if an attribute's corresponding property is spelled differently, e.g. data-foo becomes dataFoo
			// eslint-disable-next-line jsdoc/valid-types
			target[attributeKey] = /** @type {Target[keyof Target]} */(value); // TODO3: Make a bug in eslint-plugin-jsdoc for this?
		} else {
			target.setAttribute(
				/** @type {string} */(attributeKey),
				/** @type {string} */(value),
			);
		}
		if (attributeValueIsEmpty(value)) {
			target.removeAttribute(attributeName);
		}
	}
	return target;
}

/**
 * Set the given CSS properties on the target element via the `[style]` attribute.
 * Note that the camelCased properties have to be used, e.g. `borderWidth` -- Typescript doesn't appear to "know" about the spine-cased ones, e.g. `border-width`.
 * @template {HTMLElement | SVGElement} Target
 * @param {Target} target
 * @param {Partial<CSSStyleDeclaration>} properties
 * @returns {Target}
 */
export function setStyle(target, properties) {
	for (const propertyName in properties) {
		target.style[propertyName] = /** @type {string} */(properties[propertyName]);
	}
	return target;
}

/**
 * Returns the given dict as a string of HTML attributes
 * @param {Record<string, Textish>} input
 * @returns {string}
 */
export function toAttributes(input) {
	const out = [];
	for (const attributeName in input) {
		let value = input[attributeName];
		if (attributeValueIsEmpty(value)) {
			continue;
		}
		if (typeof value !== `string`) {
			value = /** @type {Exclude<Textish, null | undefined>} */(value).toString();
		}
		out.push(`${attributeName}="${value}"`);
	}
	return out.join(` `);
}
