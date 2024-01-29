import type { Textish } from './types.d.ts';

export type ElAttributes<Subclass extends HTMLElement> =
	& Omit<Subclass,
		| `class`
		| `style`
	>
	& {
	class: string;
	style: Partial<CSSStyleDeclaration>;
};

export const attributeValueIsEmpty = (value: unknown) =>
	value === undefined
	|| value === null
	|| value === `undefined`
	|| value === `null`;

export function getAttributes(target: HTMLElement) {
	const attributes: Record<string, string> = {};
	for (const attribute of target.attributes) {
		attributes[attribute.name] = attribute.value;
	}
	return attributes as Partial<ElAttributes<typeof target>>;
}

export function setAttributes<Subclass extends HTMLElement>(
	target: Subclass,
	source: HTMLElement | Partial<ElAttributes<typeof target>>
) {
	const updates = {
		...source instanceof HTMLElement ? getAttributes(source) : source,
	};
	for (const attributeName in updates) {
		const attributeKey = attributeName as keyof Subclass;
		const value = updates[attributeName as keyof typeof updates];
		if (attributeValueIsEmpty(value)) {
			target.removeAttribute(attributeName);
		} else if (attributeKey === `style`) {
			if (typeof value === `string`) {
				target.setAttribute(`style`, value);
			} else {
				const properties = value as unknown as CSSStyleDeclaration;
				for (const propertyName in properties) {
					target.style.setProperty(propertyName, properties[propertyName]);
				}
			}
		} else if (attributeKey in target) {
			target[attributeKey] = value as Subclass[typeof attributeKey];
		} else {
			target.setAttribute(attributeKey as string, value as string);
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
