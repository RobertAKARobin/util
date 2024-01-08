export type AttributeValue = string | number | boolean | undefined | null | symbol | URL;

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

export function replaceAttributes(
	target: HTMLElement,
	newAttributes: Partial<{
		[Key in keyof typeof target]: typeof target[Key];
	}>
) {
	const attributeNames = new Set(
		...Object.keys(newAttributes),
		...target.getAttributeNames(),
	);

	const updatedAttributes = {} as Record<string, unknown>;
	for (const attributeName of attributeNames) {
		const attributeKey = attributeName as keyof typeof newAttributes;
		updatedAttributes[attributeName] = newAttributes[attributeKey];
	}

	return setAttributes(target, updatedAttributes);
}

export function setAttributes(
	target: HTMLElement,
	attributes: Partial<{
		[Key in keyof typeof target]: typeof target[Key];
	}>
) {
	for (const attributeName in attributes) {
		const attributeKey = attributeName as keyof typeof target;
		const value = attributes[attributeKey] as AttributeValue;
		if (attributeValueIsEmpty(value)) {
			target.removeAttribute(attributeName);
		} else {
			target.setAttribute(
				attributeName,
				(value as Exclude<AttributeValue, null | undefined>).toString()
			);
		}
	}
	return target;
}

export function toAttributes(input: Record<string, AttributeValue>) {
	const out = [];
	for (const attributeName in input) {
		let value = input[attributeName];
		if (attributeValueIsEmpty(value)) {
			continue;
		}
		if (typeof value !== `string`) {
			value = (value as Exclude<AttributeValue, null | undefined>).toString();
		}
		out.push(`${attributeName}="${value}"`);
	}
	return out.join(` `);
}
