/**
 * @import { Emitter, IGNORE as EmitterIgnore } from '../emitter/emitter'
 * @import { ElAttributes } from '../dom/types.d';
 * @import { ConstructorOf, Textish } from '../types.d';
 */

import {
	attributeValueIsEmpty,
	setAttributes,
	setStyle,
} from '../dom/attributes.js';
import { newUid } from '../uid.js';
import { runContext } from '../web/context.js';

export { css, html } from '../string/template.js';


/* eslint-disable jsdoc/valid-types */
/**
 * @typedef {Omit<typeof Component,
 * | `attribute`
 * | `cache`
 * | `cacheBust`
 * | `const`
 * | `custom`
 * | `define`
 * | `event`
 * | `normalize`
 * | `registry`
 * | `style`
 * | `stylePath`
 * | `uid`
 * >} ComponentWithoutDecorators
 */
/* eslint-enable jsdoc/valid-types */

/**
 * TODO1
 * TODO1 Add interfaces for WebComponent and `handleEvent`, which this implements, in order to show where those come from?
 */
export class Component extends HTMLElement {
	/**
	 * TODO1
	 * @type {Map<string, WeakRef<Component>>}
	 * @readonly
	 */
	static cache = new Map();

	/**
	 * TODO1
	 * @readonly
	 */
	static const = /** @type {const} */({
		attrEl: `is`,
		attrEmit: `data-emit-`,
		attrEmitDelimiter: `|`,
		attrOn: `data-on-`,
		globalRef: `C`,
		styleAttr: `data-style`,
		styleUrlAttrPrefix: `data-`,
	});

	/**
	 * TODO1
	 * @type {string}
	 * @readonly
	 */
	static elName;

	/**
	 * TODO1
	 * @type {Array<string>}
	 * @readonly
	 */
	static observedAttributes = [];

	/**
	 * TODO1
	 * @type {Record<string, string>}
	 * @readonly
	 */
	static propertyNamesByAttribute = {};

	/**
	 * TODO1
	 * @type {Map<typeof Component['elName'], typeof Component>}
	 * @readonly
	 */
	static registry = new Map();

	/**
	 * TODO1
	 * @type {string}
	 * @readonly
	 */
	static selector;

	/**
	 * TODO1
	 * @type {string | undefined}
	 * @readonly
	 */
	static style;

	/**
	 * TODO1
	 * @type {string | undefined}
	 * @readonly
	 */
	static stylePath;

	/**
	 * TODO1
	 * @type {keyof HTMLElementTagNameMap | undefined}
	 * @readonly
	 */
	static tagName;

	static {
		/* eslint-disable jsdoc/valid-types */
		/** @type {{ [Component.const.globalRef]: typeof Component }} */(
			/** @type {unknown} */(globalThis)
		)[Component.const.globalRef] = Component; // Makes Component available as `window.C`, for debugging
		/* eslint-enable jsdoc/valid-types */
	}

	/**
	 * Decorator that defines a property that will be exposed as an HTML element in the DOM
	 * @param {object} [options]
	 * @param {string} [options.name] - The name that will be used for the attribute. If not specified, the property name will be used, downcased and prefixed with `l-`
	 * @returns {(target: Component, propertyName: string) => void}
	 */
	static attribute(options = {}) {
		return function(target, propertyName) {
			const attributeName = options?.name ?? propertyName;
			const Constructor = /** @type {typeof Component} */(target.constructor);
			Constructor.observedAttributes.push(attributeName);
			Constructor.propertyNamesByAttribute[attributeName] = propertyName;

			Object.defineProperty(Constructor.prototype, propertyName, {
				get(/** @type {Component} */this) {
					return this.getAttribute(attributeName);
				},
				set(
					/** @type {Component} */this,
					/** @type {Textish} */value,
				) {
					if (attributeValueIsEmpty(value)) {
						this.removeAttribute(attributeName);
					} else {
						this.setAttribute(
							attributeName,
							/** @type {string} */(value).toString(),
						);
					}
				},
			});
		};
	}

	/**
	 * TODO1
	 * @returns {string}
	 */
	static cacheBust() {
		return `?cache=${Date.now().toString()}`;
	}

	/**
	 * Adds common component methods/helpers to the specified HTML element constructor
	 * @template {keyof HTMLElementTagNameMap} TagName
	 * @template {HTMLElementTagNameMap[TagName]} Tag
	 * @param {TagName} tagName
	 * @returns {ConstructorOf<HTMLElementTagNameMap[TagName] & Component>}
	 */
	static custom(tagName) {
		const dummy = document.createElement(tagName);
		const BaseElement = /** @type {ConstructorOf<Component>} */(
			/** @type {unknown} */(dummy.constructor)
		);

		/**
		 * @implements {Component}
		 */
		class ComponentBase extends BaseElement {
			// static readonly elName = Component.elName;
			// static readonly find = Component.find;
			// static readonly findAll = Component.findAll;
			// static readonly formatCss = Component.formatCss;
			// static readonly id = Component.id;
			// static readonly observedAttributes = Component.observedAttributes;
			// static readonly propertyNamesByAttribute = Component.propertyNamesByAttribute;
			// static readonly selector = Component.selector;
			// static readonly style = Component.style;
			// static readonly stylePath = Component.stylePath;
			// static readonly tagName = tagName;

			constructor() {
				super();
				this.setAttribute(Component.const.attrEl, this.Ctor.elName);
				this.constructed();
			}
		}

		const instanceProperties = Object.getOwnPropertyDescriptors(Component.prototype);
		for (const instancePropertyName in instanceProperties) { // Note that this includes _prototype_ properties, but not _instance_ properties: https://stackoverflow.com/q/77733619/2053389
			const instanceProperty = instanceProperties[instancePropertyName];
			Object.defineProperty(ComponentBase.prototype, instancePropertyName, instanceProperty);
		}

		return /** @type {ConstructorOf<Tag & Component>} */(ComponentBase);
	}

	/**
	 * Decorator that defines a custom web component
	 * @template {typeof Component} Constructor
	 * @param {object} [options]
	 * @param {string} [options.elName] - The name that will be used for the component, e.g. `app-foo`
	 * @param {string} [options.style] - The stylesheet that will be attached to the document the first time the component is used. `:host` will be replaced with the component's selector.
	 * @param {string} [options.stylePath] - The path to an external stylesheet for this component. If it ends with `.ts`, the Builder will change the path to `.css.ts`. This means you can always set the stylepath to `import.meta.url` if the files will all follow the convention of `{component}.css.ts`.
	 * @param {string} [options.styleSrc] - TODO1
	 * @returns {(Constructor: Constructor) => void}
	 */
	static define(options = {}) {
		return function(Constructor) {
			const elName = options.elName ?? `l-${Constructor.name.toLowerCase()}`;

			const selector = Constructor.tagName === undefined
				? elName
				: `[${Component.const.attrEl}='${elName}']`;

			const stylePath = options.stylePath ?? Constructor.stylePath;
			if (typeof stylePath === `string`) {
				const styleUrl = `/${elName}.css${Component.cacheBust()}`;
				const styleUrlAttr = `${Component.const.styleUrlAttrPrefix}${elName}`;
				if (document.head.querySelector(`link[${styleUrlAttr}]`) === null) {
					const styleUrlEl = document.createElement(`link`);
					setAttributes(styleUrlEl, {
						href: styleUrl,
						rel: `stylesheet`,
					});
					styleUrlEl.setAttribute(styleUrlAttr, ``);
					document.head.appendChild(styleUrlEl);
					Object.assign(Constructor, { stylePath });
				}
			}

			Object.assign(Constructor, {
				elName,
				selector,
			});

			globalThis.customElements.define( // This should come last because when a custom element is defined its constructor runs for all instances on the page
				elName,
				Constructor,
				Constructor.tagName === undefined ? undefined : { extends: Constructor.tagName },
			);

			const style = options.style ?? Constructor.style;
			if ( // Has to come after elName has been assigned
				typeof style === `string`
				&& document.head.querySelector(`[${Component.const.styleAttr}='${elName}']`) === null
			) {
				const styleOverride = Constructor.formatCss(style);
				const styleEl = document.createElement(`style`);
				styleEl.textContent = styleOverride;
				styleEl.setAttribute(Component.const.styleAttr, elName);
				document.head.appendChild(styleEl);
				Object.assign(Constructor, { style });
			}

			Component.registry.set(elName, Constructor);
		};
	}

	/**
	 * Decorates a method so that when the method is called it emits a DOM CustomEvent with the method's name, the `detail` of which is the method's return value
	 * @template Value
	 * @param {CustomEventInit<Value>} [options]
	 * @returns {(target: Component, propertyName: string, descriptor: PropertyDescriptor) => void}
	 */
	static event(options = {}) {
		const bubbles = options.bubbles ?? true;

		return function(target, propertyName, descriptor) {
			const transformer = /** @type {(...args: any) => Value} */(descriptor.value); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
			descriptor.value = function(
				/** @type {Component} */this,
				/** @type {Parameters<typeof transformer>} */...args
			) {
				const detail = transformer.call(this, ...args); // eslint-disable-line @typescript-eslint/no-unsafe-argument
				const event = new CustomEvent(propertyName, {
					...options,
					bubbles,
					detail,
				});
				this.dispatchEvent(event);
				return detail;
			};
		};
	}

	/**
	 * Returns the first element in the document that matches this constructor type
	 * @template {Component} Instance
	 * @param {Element} [root=document.documentElement]
	 * @returns {Instance}
	 */
	static find(
		root = document.documentElement,
	) {
		const selector = this.selector;
		return /** @type {Instance} */(root.querySelector(selector));
	}

	/**
	 * Returns all elements in the document that match this constructor type
	 * @template {Component} Instance
	 * @param {Element} [root=document.documentElement]
	 * @returns {Array<Instance>}
	 */
	static findAll(
		root = document.documentElement,
	) {
		const selector = this.selector;
		return /** @type {Array<Instance>} */([...root.querySelectorAll(selector)]);
	}

	/**
	 * TODO1
	 * @param {string} input
	 * @returns {string}
	 */
	static formatCss(input) {
		return input.replace(/::?host/g, this.selector);
	}

	/**
	 * Finds or creates a Component with this ID, and returns it.
	 * @template {Component} Instance
	 * @template {ConstructorOf<Instance>} Constructor
	 * @param {HTMLElement['id']} id
	 * @param {ConstructorParameters<Constructor>} args
	 * @returns {Instance}
	 * @this {Constructor}
	 */
	static id(id, ...args) {
		let instance = /** @type {Instance} */(document.getElementById(id));
		if (instance === null) {
			instance = /** @type {Instance} */(new this(...args));
			instance.id = id;
		}
		return instance;
	}

	/**
	 * TODO1
	 * @param {string} input
	 * @returns {string}
	 */
	static normalize(input) {
		return input
			.toLowerCase()
			.replaceAll(/[^\w]/g, ``);
	}

	/**
	 * Returns a pseudo (very-pseudo) random HTMLElement ID. See {@link newUid}
	 * @returns {string}
	 */
	static uid() {
		return `l${newUid()}`;
	}

	/**
	 * See https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
	 * @type {AbortController}
	 */
	// @ts-expect-error Defined on connectedCallback
	abortController;

	/**
	 * Stores the component's textual content, if any, which can be inserted into the component's template
	 * @type {string | undefined}
	 */
	content = ``;

	/**
	 * The instance's constructor
	 * @returns {ConstructorOf<this>}
	 */
	get Ctor() {
		return /** @type {ConstructorOf<this>} */(this.constructor);
	}

	/**
	 * Dispatches on disconnectedCallback. https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal. See {@link disconnectedCallback}
	 * @type {AbortSignal}
	 * @readonly
	 */
	// @ts-expect-error Defined on connectedCallback
	disconnectedSignal;

	/**
	 * @type {Map<string, Array<HTMLElement>>}
	 * @readonly
	 */
	findDownCache = new Map();

	/**
	 * @type {Map<string, HTMLElement>}
	 * @readonly
	 */
	findUpCache = new Map();

	constructor() {
		super();
		this.constructed();
	}

	/**
	 * Called when the component is attached to a new document
	 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
	 * @returns {void}
	 */
	adoptedCallback() {}

	/**
	 * Dispatched when `attributeChangedCallback` is called. @see {@link attributeChangedCallback}
	 * @param {string} name
	 * @returns {string}
	 */
	@Component.event() // TODO1
	attributeChanged(name) {
		return name;
	}

	/**
	 * Called when one of the properties decorated with `@Component.attribute` is modified
	 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
	 * @param {string} name
	 * @param {unknown} previous
	 * @param {unknown} value
	 * @returns {void}
	 */
	attributeChangedCallback(
		name, // Not strongly typing this because that makes it annoying to subclass
		previous,
		value,
	) {
		this.attributeChanged(name);

		this.dispatchEvent(new CustomEvent(name, {
			detail: value,
		}));

		const attributeName = Component.propertyNamesByAttribute[name];
		if (name === attributeName) {
			return;
		}

		this.dispatchEvent(new CustomEvent(attributeName, {
			detail: value,
		}));
	}

	/**
	 * Called when the component is attached to the DOM
	 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
	 * @returns {void}
	 */
	connectedCallback() {
		const abortController = new AbortController();
		Object.assign(this, {
			abortController,
			disconnectedSignal: abortController.signal,
		});

		for (const attribute of this.attributes) {
			if (attribute.name.startsWith(Component.const.attrOn)) {
				const eventName = attribute.value;
				this.addEventListener(eventName, this);
			}
		}
	}

	/**
	 * Called by the constructor. Needed because customized and autonomous components have different constructors.
	 * TODO2: Would prefer this to be private, but TS won't emit the declaration if it is https://github.com/microsoft/TypeScript/issues/30355
	 * @returns {void}
	 */
	constructed() {
		Object.assign(this, {
			findDownCache: new Map(),
			findUpCache: new Map(),
		});
	}


	/**
	 * Applies the given CSS rules to the Component's `style` attribute
	 * @param {Partial<CSSStyleDeclaration>} input
	 * @returns {this}
	 */
	css(input) {
		return setStyle(this, input);
	}

	/**
	 * Dispatched when `disconnectedCallback` is called. @see {@link disconnectedCallback}
	 * @returns {void}
	 */
	@Component.event() // TODO1
	disconnected() {}

	/**
	 * Called when the component is detached from the DOM
	 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
	 * @returns {void}
	 */
	disconnectedCallback() {
		this.abortController.abort();
		this.disconnected();
	}

	/**
	 * Looks for and returns the first instance of the specified constructor or selector within the current component's template
	 * @template {ConstructorOf<Component>} Constructor
	 * @template {InstanceType<Constructor>} Descendant
	 * @overload
	 * @param {Constructor} target
	 * @returns {Array<Descendant>}
	 */
	/**
	 * @template {keyof HTMLElementTagNameMap} TagName
	 * @template {HTMLElementTagNameMap[TagName]} Descendant
	 * @overload
	 * @param {TagName} target
	 * @returns {Array<Descendant>}
	 */
	/**
	 * @overload
	 * @param {string} target
	 * @returns {Array<HTMLElement>}
	 */
	/**
	 * @param {Function | string} target
	 * @returns {Array<unknown>}
	 */
	findDown(target) {
		const selector = target === Page
			? `[${Page.pageAttr}]`
			: typeof target === `string`
				? target
				: /** @type {typeof Component} */(target).selector;

		const results = this.findDownCache.get(selector)
			?? [...this.querySelectorAll(selector)];
		this.findDownCache.set(
			selector,
			/** @type {Array<HTMLElement>} */(results),
		);
		return results;
	}

	/**
	 * Looks for and returns the nearest instance of the specified constructor among the current component's ancestors
	 * @template {keyof HTMLElementTagNameMap} TagName
	 * @overload
	 * @param {TagName} target
	 * @returns {HTMLElementTagNameMap[TagName]}
	 */
	/**
	 * @template {ConstructorOf<Component>} Constructor
	 * @overload
	 * @param {Constructor} target
	 * @returns {Constructor}
	 */
	/**
	 * @overload
	 * @param {string} target
	 * @returns {HTMLElement}
	 */
	/**
	 * @param {Function | string} target
	 * @returns {unknown}
	 */
	findUp(target) {
		const selector = target === Page
			? `[${Page.pageAttr}]`
			: typeof target === `string`
				? target
				: /** @type {typeof Component} */(target).selector;

		const result = this.findUpCache.get(selector) ?? this.closest(selector);
		this.findUpCache.set(
			selector,
			/** @type {HTMLElement} */(result),
		);
		return result;
	}

	/**
	 * Inherited from HTMLElement. Used internally to respond to events on child elements. https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#listener
	 * @param {Event} event
	 * @returns {void}
	 */
	handleEvent(event) {
		const trigger = /** @type {Element} */(event.target);
		const paramsAttr = `${Component.const.attrEmit}${Component.normalize(event.type)}-`;
		const attrEmitDelimiter = Component.const.attrEmitDelimiter;
		const normalizedId = Component.normalize(this.id);
		for (const attribute of trigger.attributes) {
			if (attribute.name.startsWith(paramsAttr) === false) {
				continue;
			}

			const id = attribute.name.slice(paramsAttr.length);
			if (normalizedId !== id) {
				continue;
			}

			const [handlerKey, ...args] = attribute.value.split(attrEmitDelimiter);
			// @ts-expect-error handlerKey should correspond to an event listener function
			this[handlerKey](event, ...args); // eslint-disable-line @typescript-eslint/no-unsafe-call
		}
	}

	/**
	 * When `this` emits the given event, call `this`'s specified handler. Safe for SSG.
	 * Assumes event names are all camelCase. TODO2: Support event names with special characters, i.e. spaces and hyphens
	 */
	on<
		EventName extends keyof HTMLElementEventMap,
		EventType extends HTMLElementEventMap[EventName],
		Listener extends Record<HandlerKey, (event: EventType, ...args: Args) => void>,
		HandlerKey extends PropertyKey,
		Args extends Array<number | string>,
	>(
		this: Listener,
		eventName: EventName,
		handlerKey: HandlerKey,
		...args: Args
	): string;

	/**
	 * When `this` emits the given event, call the specified listener's specified handler. Safe for SSG.
	 */
	on<
		Self extends Record<EventName, (...args: any) => void>, // eslint-disable-line @typescript-eslint/no-explicit-any
		EventName extends PropertyKey,
		EventDetail extends ReturnType<Self[EventName]>,
		EventType extends CustomEvent<EventDetail>,
		Listener extends Record<HandlerKey, (event: EventType, ...args: Args) => void>,
		HandlerKey extends PropertyKey,
		Args extends Array<number | string>,
	>(
		this: Self,
		eventName: EventName,
		listener: Listener,
		handlerKey: HandlerKey,
		...args: Args
	): Self;
	/**
	 * When `this` emits the `attributeChanged` event for the given attribute, call the specified listener's specified handler. Safe for SSG.
	 */
	on<
		AttributeName extends keyof this,
		EventType extends CustomEvent<this[AttributeName]>,
		Listener extends Record<HandlerKey, (event: EventType, ...args: Args) => void>,
		HandlerKey extends PropertyKey,
		Args extends Array<number | string>,
	>(
		attributeName: AttributeName,
		listener: Listener,
		handlerKey: HandlerKey,
		...args: Args
	): this;

	/**
	 * When `this` emits the given event, call the given handler. *NOT* safe for SSG.
	 */
	on<
		EventName extends keyof HTMLElementEventMap,
		EventType extends HTMLElementEventMap[EventName],
		Handler extends (event: EventType) => void,
	>(
		eventName: EventName,
		handler: Handler,
	): this;
	/**
	 * When `this` emits the given event, call the given handler. *NOT* safe for SSG.
	 */
	on<
		Self extends Record<EventName, (...args: any) => void>, // eslint-disable-line @typescript-eslint/no-explicit-any
		EventName extends PropertyKey,
		EventDetail extends ReturnType<Self[EventName]>,
		EventType extends CustomEvent<EventDetail>,
		Handler extends (event: EventType) => void,
	>(
		this: Self,
		eventName: EventName,
		handler: Handler,
	): Self;
	/**
	 * When `this` emits the `attributeChanged` event for the given attribute, call the given handler. *NOT* safe for SSG.
	 */
	on<
		AttributeName extends keyof this,
		EventType extends CustomEvent<this[AttributeName]>,
		Handler extends (event: EventType) => void,
	>(
		attributeName: AttributeName,
		handler: Handler,
	): this;

	on(
		this: Component,
		eventName: string,
		handlerKeyOrListener: Component | Function | string,
		...args: Array<number | string>
	): Component | string {
		let handlerKey: string;
		let handlerArgs: Array<unknown>;
		let listener: Component;
		if (typeof handlerKeyOrListener === `function`) {
			this.addEventListener(
				eventName as keyof HTMLElementEventMap,
				handlerKeyOrListener as (event: Event) => void,
				eventName === `disconnected`
					? { once: true }
					: { signal: this.disconnectedSignal },
			);
			return this;
		} else if (typeof handlerKeyOrListener === `string`) {
			listener = this;
			handlerKey = handlerKeyOrListener;
			handlerArgs = args;
		} else {
			listener = handlerKeyOrListener!;
			handlerKey = args[0] as string;
			handlerArgs = args.slice(1);
		}

		const eventNameNormalized = Component.normalize(eventName);
		listener.id = listener.id === `` ? Component.uid() : listener.id;
		listener.setAttribute(`${Component.const.attrOn}${eventNameNormalized}`, eventName); // TODO3: Do this only on build?
		listener.addEventListener(eventName, listener);

		const listenerIdNormalized = Component.normalize(listener.id);
		const params = [
			handlerKey,
			...handlerArgs,
		].join(Component.const.attrEmitDelimiter);
		const paramsAttr = `${Component.const.attrEmit}${eventNameNormalized}-${listenerIdNormalized}`;

		if (typeof handlerKeyOrListener === `string`) { // It's a standard DOM element, not a Component
			return `${paramsAttr}="${params}"`;
		}

		this.setAttribute(paramsAttr, params);
		return this;
	}

	/**
	 * Makes the component matching the rootSelector update its attributes replace its contents with newly-rendered contents. If no rootSelector is provided, the root is `this`.
	 * @param {string} [rootSelector]
	 * @returns {this}
	 */
	render(rootSelector) {
		this.findDownCache.clear();

		const template = document.createElement(`div`); // Was using `<template>`, but the fact that its children are inside a documentFragment was annoying. Oddly enough according to JSBench using `<div>` is actually 2x faster
		template.innerHTML = this.template();

		let sourceRoot = rootSelector === undefined
			? (template as Node)
			: undefined;

		const restartIterator = () => document.createTreeWalker(
			sourceRoot ?? template,
			NodeFilter.SHOW_ELEMENT,
			() => NodeFilter.FILTER_ACCEPT,
		);

		let treeIsInSourceRoot = false;
		let iterator = restartIterator();
		let target = iterator.nextNode();
		while (true) {
			if (target === null) {
				break;
			}

			if (target instanceof HTMLElement === false) {
				target = iterator.nextNode();
				continue;
			}

			if (sourceRoot === undefined) {
				if (rootSelector !== undefined && target.matches(rootSelector)) {
					sourceRoot = target;
				}
			}

			const targetIsInSourceRoot = (
				sourceRoot !== undefined && sourceRoot !== target && sourceRoot.contains(target) // TODO3: Can probably optimize this to not need to call `.contains` each time
			);

			if (treeIsInSourceRoot && targetIsInSourceRoot === false) { // The current tree was in sourceRoot, now it's not, so assume we've exited sourceRoot and shouldn't process further
				break;
			}

			treeIsInSourceRoot = targetIsInSourceRoot;

			const tagName = target.tagName.toUpperCase();

			if (tagName === `PLACEHOLDER`) {
				const placeholder = target as HTMLUnknownElement;
				const id = placeholder.id;
				let cached = Component.cache.get(id)!.deref()!;
				Component.cache.delete(id);

				if (cached.isConnected && targetIsInSourceRoot === false) {
					cached = cached.cloneNode() as Component; // Note that cloneNode calls the constructor!
				}

				cached.innerHTML = cached.template();
				target = iterator.previousNode();
				placeholder.replaceWith(cached);
				if (target === null) { // If placeholder is the first element, the iterator apparently gets stuck and needs to restart
					iterator = restartIterator();
				}
				target = iterator.nextNode();
				continue;

			} else if (tagName === `HOST`) {
				const parent = target.parentElement! ?? template;
				setAttributes(parent, target);
				iterator.previousNode();
				target.replaceWith(...target.childNodes);
				target = iterator.nextNode();
				continue;
			}

			target = iterator.nextNode();
		}

		const destinationRoot = rootSelector === undefined
			? this
			: this.querySelector(rootSelector) as HTMLElement;

		setAttributes(destinationRoot, sourceRoot as Element);
		destinationRoot.replaceChildren(...sourceRoot!.childNodes);
		this.rendered();
		return this;
	}

	/**
	 * Called when the component finishes rendering
	 * @returns {void}
	 */
	rendered() {}

	/**
	 * Sets multiple attributes or properties
	 * @param {Partial<ElAttributes<this>>} attributes
	 * @returns {this}
	 */
	set(attributes) {
		setAttributes(this, attributes);
		return this;
	}

	/**
	 * Defines what is written into the document when this instance is rendered
	 * @param {string} [subclassTemplate]
	 * @returns {string}
	 */
	template(subclassTemplate) {
		return subclassTemplate ?? this.content ?? ``;
	}

	/**
	 * Returns a placeholder element that will be hydrated into the full component during rendering.
	 * @override
	 */
	toString() {
		const tempId = this.id === `` ? Component.uid() : this.id;
		Component.cache.set(tempId, new WeakRef(this));
		return `<placeholder id="${tempId}"></placeholder>`;
	}

	/**
	 * Unsubscribes from the given emitter when this Component is disconnected. Important for preventing memory leaks
	 * @template State
	 * @param {Emitter<State>} emitter
	 * @returns {Emitter<State>}
	 */
	watch(emitter) {
		/** @type {EmitterIgnore} */
		const ignore = `_IGNORE_`;

		return emitter.pipe((value, meta) => {
			if (this.isConnected === false) {
				meta.emitter.unsubscribe(meta.handler);
				return ignore;
			}
			return value;
		});
	}

	/**
	 * A shortcut for setting the component's `content` property.
	 * @param {string} input
	 * @returns {this}
	 */
	write(input) {
		this.content = input;
		return this;
	}
}

export class Page extends Component.custom(`main`) {
	static pageAttr = `data-page-title`;

	/**
	 * @type {string}
	 */
	@Component.attribute({ name: Page.pageAttr }) pageTitle = `pageTitle`;

	/**
	 * @param {{ title?: Page['pageTitle'] }} [input]
	 */
	constructor(input = {}) {
		super();
		if (input.title !== undefined) {
			this.pageTitle = input.title;
		}
	}
}

if (runContext !== `browser`) {
	// Override DOM-dependent methods since these may not be availble during SSR. Doing it here instead of in Component because these methods are run a lot, and we don't have to do an unnecessary `runContext` check each time.
	// Have to set Page here too because Page doesn't directly extend Component; it uses Component.custom
	// TODO2: Do this in a way that subclasses can still customize `render` and `toString`
	// TODO2: Do this such that we don't need to include it in front-end code
	Component.prototype.render = Page.prototype.render = function() {
		this.innerHTML = this.template();
		return this;
	};

	Component.prototype.toString = Page.prototype.toString = function() {
		this.render();
		return this.outerHTML;
	};
}
