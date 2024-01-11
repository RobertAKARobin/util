import type { Textish } from './types.d.ts';
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
	return attributes;
}

export function setAttributes(
	target: HTMLElement,
	attributes: Partial<{
		[Key in keyof typeof target]: typeof target[Key];
	}>
) {
	for (const attributeName in attributes) {
		const attributeKey = attributeName as keyof typeof target;
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
