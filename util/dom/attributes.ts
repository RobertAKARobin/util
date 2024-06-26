import type { Textish } from '../types.d.ts';

export type ElAttributes<Subclass extends Element> = {
	[Key in keyof Subclass]: Subclass[Key] extends Function ? Function : number | string;
} & {
	class: string;
	style: string;
};

/**
 * Returns true if value is undefined, null, or the literal strings `undefined` or `null`
 */
export const attributeValueIsEmpty = (value: unknown) =>
	value === undefined
	|| value === null
	|| value === `undefined`
	|| value === `null`;

export function getAttributes(target: Element) {
	const attributes: Record<string, string> = {};
	for (const attribute of target.attributes) {
		attributes[attribute.name] = attribute.value;
	}
	return attributes as Partial<ElAttributes<typeof target>>;
}

/**
 * Calls `.setAttribute` on the target for each of the given properties. Calls `.removeAttribute` if given value is empty; see {@link attributeValueIsEmpty}.
 */
export function setAttributes<Subclass extends Element>(
	target: Subclass,
	source: Element | Partial<ElAttributes<Subclass>>,
) {
	const updates = {
		...source instanceof Element ? getAttributes(source) : source,
	};
	for (const attributeName in updates) {
		const attributeKey = attributeName as keyof Subclass;
		const value = updates[attributeName as keyof typeof updates];
		if (attributeKey in target) {
			target[attributeKey] = value as unknown as Subclass[keyof Subclass];
		}
		if (attributeValueIsEmpty(value)) {
			target.removeAttribute(attributeName);
		} else if (!(attributeKey in target)) {
			target.setAttribute(attributeKey as string, value as string);
		}
	}
	return target;
}

/**
 * Set the given CSS properties on the target element via the `[style]` attribute.
 * Note that the camelCased properties have to be used, e.g. `borderWidth` -- Typescript doesn't appear to "know" about the spine-cased ones, e.g. `border-width`.
 */
export function setStyle(
	target: HTMLElement | SVGElement,
	properties: Partial<CSSStyleDeclaration>,
) {
	for (const propertyName in properties) {
		target.style[propertyName] = properties[propertyName]!;
	}
	return target;
}

/**
 * Returns the given dict as a string of HTML attributes
 */
export function toAttributes(input: Record<string, Textish>) {
	const out = [];
	for (const attributeName in input) {
		let value = input[attributeName];
		if (attributeValueIsEmpty(value)) {
			continue;
		}
		if (typeof value !== `string`) {
			value = (value as Exclude<Textish, null | undefined>).toString();
		}
		out.push(`${attributeName}="${value}"`);
	}
	return out.join(` `);
}
