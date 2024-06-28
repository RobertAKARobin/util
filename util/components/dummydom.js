/**
 * Naive minimal substitution for the DOM standard library, allowing Components to be built without needing to import e.g. JSDOM
 */

const elementsById = {};

export class Element {
	attributes = {};
	get id() {
		return this.attributes.id ?? ``;
	}
	set id(id) {
		elementsById[id] = this;
		this.attributes.id = id;
	}
	innerHTML;
	get outerHTML() {
		const attributes = Object.entries(this.attributes).map(
			([key, value]) => `${key}="${value}"`,
		).join(` `);
		return `<${this.tagName} ${attributes}>${this.innerHTML}</${this.tagName}>`;
	}
	tagName;

	constructor() {
		this.tagName = this.constructor.tagName;
	}

	addEventListener() {}

	appendChild() {}

	getAttribute(key) {
		return this.attributes[key] ?? this[key];
	}

	querySelector() {
		return null;
	}

	querySelectorAll() {
		return [];
	}

	removeAttribute(key) {
		delete this.attributes[key];
	}

	setAttribute(key, value) {
		this.attributes[key] = value;
	}

	toString() {
		return this.outerHTML;
	}
}

export class HTMLElement extends Element {}

export const customElements = {
	define() {},
};

export const document = {
	createElement(tagName) {
		const element = new HTMLElement();
		element.tagName = tagName.toUpperCase();
		return element;
	},

	getElementById(id) {
		return elementsById[id] ?? null;
	},

	head: new HTMLElement(),
};

Object.assign(globalThis, {
	Element,
	HTMLElement,
	customElements,
	document,
});
