import type { Textish } from './types.d.ts';

export type ElAttributes<Subclass extends HTMLElement> =
	& Omit<Subclass,
		| `class`
		| `style`
	>
	& {
	class: string;
	style: string;
};

export function attributesToDict(target: HTMLElement) {
	const attributes: Record<string, string> = {};
	for (const attribute of target.attributes) {
		attributes[attribute.name] = attribute.value;
	}
	return attributes;
}

export function attributeValueIsEmpty(value: unknown) {
	return value === undefined
		|| value === null
		|| value === `undefined`
		|| value === `null`;
}

export function getAttributes(target: HTMLElement) {
	const attributes = {} as Record<string, string | null>;
	for (const attributeName of target.getAttributeNames()) {
		attributes[attributeName] = target.getAttribute(attributeName);
	}
	return attributes as Partial<ElAttributes<typeof target>>;
}

export function mergeAttributes(target: HTMLElement, source: HTMLElement) {
	for (const attribute of target.attributes) { // All this work keeps the attributes in more-or-less the same order, which has no impact on the page's performance, but does make things look more consistent and easier to test
		const name = attribute.name;
		if (source.hasAttribute(name)) {
			const value = source.getAttribute(name);
			if (attributeValueIsEmpty(value)) {
				target.removeAttribute(attribute.name);
			} else {
				target.setAttribute(attribute.name, value!);
			}
			source.removeAttribute(name);
		}
	}
	for (const attribute of source.attributes) {
		const name = attribute.name;
		const value = attribute.value;
		target.setAttribute(name, value);
	}
}

export function setAttributes<Subclass extends HTMLElement>(
	target: Subclass,
	attributes: Partial<ElAttributes<typeof target>>
) {
	for (const attribute of target.attributes) {
		target.removeAttribute(attribute.name);
	}
	for (const attributeName in attributes) {
		const attributeKey = attributeName as keyof ElAttributes<Subclass>;
		const value = attributes[attributeKey] as Textish;
		if (attributeValueIsEmpty(value)) {
			target.removeAttribute(attributeName);
		} else {
			target.setAttribute(
				attributeName,
				(value as Exclude<Textish, null | undefined>).toString()
			);
		}
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
