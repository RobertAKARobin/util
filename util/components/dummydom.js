/**
 * Very naive and minimal substitution for the DOM standard library, allowing Components to be built without needing to import e.g. JSDOM
 */

const elementsById = {};

const voidElements = new Set(
	`area, base, br, col, embed, hr, img, input, link, meta, source, track, wbr`.split(`, `),
); // https://html.spec.whatwg.org/multipage/syntax.html#void-elements

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
		const tagName = this.tagName.toLowerCase();
		const attributes = Object.entries(this.attributes).map(
			([key, value]) => `${key}="${value}"`,
		).join(` `);
		if (voidElements.has(tagName)) {
			return `<${tagName} ${attributes} />`;
		}
		return `<${tagName} ${attributes}>${this.innerHTML ?? ``}</${tagName}>`;
	}
	style = {};
	tagName;
	get textContent() {
		return this.innerHTML;
	}
	set textContent(value) {
		this.innerHTML = value;
	}

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
	define(elName, Constructor) {
		customElements.registry[elName] = Constructor;
	},

	registry: {},
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
