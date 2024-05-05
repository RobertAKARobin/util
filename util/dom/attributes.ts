import type { Textish } from '../types.d.ts';

export type ElAttributes<Subclass extends Element> =
	& Omit<Subclass,
		| `class`
		| `style`
	>
	& {
		class: string;
		style: string;
	};

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

export function setAttributes<Subclass extends Element>(
	target: Subclass,
	source: Element | Partial<ElAttributes<typeof target>>
) {
	const updates = {
		...source instanceof Element ? getAttributes(source) : source,
	};
	for (const attributeName in updates) {
		const attributeKey = attributeName as keyof Subclass;
		const value = updates[attributeName as keyof typeof updates];
		if (attributeKey in target) {
			target[attributeKey] = value as Subclass[typeof attributeKey];
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
export function style(target: HTMLElement | SVGElement, properties: Partial<CSSStyleDeclaration>) {
	for (const propertyName in properties) {
		target.style[propertyName] = properties[propertyName]!;
	}
	return target;
}

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
