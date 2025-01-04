/**
 * Very naive and minimal substitution for the DOM standard library, allowing Components to be built without needing to import e.g. JSDOM
 */
/**
 * @type Record<string, Element>
 */
const elementsById = {};

const voidElements = new Set(
	`area, base, br, col, embed, hr, img, input, link, meta, source, track, wbr`.split(`, `),
); // https://html.spec.whatwg.org/multipage/syntax.html#void-elements


export class Element {
	/**
	 * @type {Record<string, string>}
	 */
	attributes = {};
	get id() {
		return this.attributes.id ?? ``;
	}
	/**
	 * @param {string} id
	 */
	set id(id) {
		elementsById[id] = this;
		this.attributes.id = id;
	}
	/**
	 * @type {string|undefined}
	 */
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
	/**
	 * @type {Record<string, string>}
	 */
	style = {};
	/**
	 * @type {string}
	 */
	tagName;
	get textContent() {
		return this.innerHTML;
	}
	set textContent(value) {
		this.innerHTML = value;
	}

	constructor() {
		// @ts-expect-error Close enough
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this.tagName = this.constructor.tagName;
	}

	addEventListener() {}

	appendChild() {}

	/**
	 * @param {string} key
	 */
	getAttribute(key) {
		// @ts-expect-error Close enough
		return this.attributes[key] ?? this[key];
	}

	querySelector() {
		return null;
	}

	querySelectorAll() {
		return [];
	}

	/**
	 * @param {string} key
	 */
	removeAttribute(key) {
		delete this.attributes[key];
	}

	/**
	 * @param {string} key
	 * @param {string} value
	 */
	setAttribute(key, value) {
		this.attributes[key] = value;
	}

	toString() {
		return this.outerHTML;
	}
}

export class HTMLElement extends Element {}

export const customElements = {
	/**
	 * @param {string} elName
	 * @param {Function} Constructor
	 */
	define(elName, Constructor) {
		customElements.registry[elName] = Constructor;
	},

	/**
	 * @type {Record<string, Function>}
	 */
	registry: {},
};

export const document = {
	/**
	 * @param {string} tagName
	 */
	createElement(tagName) {
		const element = new HTMLElement();
		element.tagName = tagName.toUpperCase();
		return element;
	},

	/**
	 * @param {string} id
	 */
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
