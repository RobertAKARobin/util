import {
	attributeValueIsEmpty,
	type ElAttributes,
	setAttributes,
	style,
} from '../dom/attributes.ts';
import { Emitter, type SubscriptionHandler } from '../emitter/emitter.ts';
import { newUid } from '../uid.ts';
import { pipeFilter } from '../emitter/pipe/filter.ts';
import { pipeUntil } from '../emitter/pipe/until.ts';
import type { Textish } from '../types.d.ts';

export { css, html } from '../string/template.ts';

type Constructor<Classtype> = new (...args: any) => Classtype; // eslint-disable-line @typescript-eslint/no-explicit-any

type ComponentWithoutDecorators = Omit<typeof Component,
	| `attribute`
	| `cache`
	| `const`
	| `custom`
	| `define`
	| `event`
	| `relay`
	| `setRelayListeners`
	| `uid`
>;

export class Component extends HTMLElement {
	static readonly cache = new Map<string, WeakRef<Component>>();
	static readonly const = {
		attrEl: `is`,
		attrEmit: `data-emit-`,
		attrEmitDelimiter: `|`,
		globalRef: `C`,
		relayAttr: `data-relay-`,
		styleAttr: `data-style`,
	} as const;
	static readonly elName: string;
	static readonly observedAttributes = [] as Array<string>;
	static readonly propertyNamesByAttribute: Record<string, string> = {};
	static readonly selector: string;
	static readonly tagName?: keyof HTMLElementTagNameMap;

	static {
		(globalThis as unknown as {
			[Component.const.globalRef]: typeof Component;
		})[Component.const.globalRef] = Component; // For debugging

		for (const attribute of document.body.attributes) {
			if (attribute.name.startsWith(Component.const.relayAttr)) {
				const eventName = attribute.name.slice(Component.const.relayAttr.length);
				document.body.addEventListener(eventName, Component.relay);
			}
		}
	}

	/**
	 * Defines a property that will be exposed as an HTML element in the DOM
	 * @param options.name The name that will be used for the attribute. If not specified, the property name will be used, downcased and prefixed with `l-`
	 */
	static attribute(options: Partial<{
		name: string;
	}> = {}) {
		return function(
			target: Component,
			propertyName: string,
		) {
			const attributeName = options?.name ?? propertyName;
			const Constructor = target.constructor as typeof Component;
			Constructor.observedAttributes.push(attributeName);
			Constructor.propertyNamesByAttribute[attributeName] = propertyName;

			Object.defineProperty(Constructor.prototype, propertyName, {
				get(this: Component) {
					return this.getAttribute(attributeName);
				},
				set(this: Component, value: Textish) {
					if (attributeValueIsEmpty(value)) {
						this.removeAttribute(attributeName);
					} else {
						this.setAttribute(
							attributeName,
							(value as Exclude<Textish, null | undefined>).toString()
						);
					}
				},
			});
		};
	}

	/**
	 * Adds common component methods/helpers to the specified HTML element constructor
	 */
	static custom<
		TagName extends keyof HTMLElementTagNameMap,
	>(tagName: TagName) {
		const $dummy = document.createElement(tagName);
		const BaseElement = $dummy.constructor as Constructor<HTMLElementTagNameMap[TagName]>;

		interface ComponentBase extends Component {} // eslint-disable-line no-restricted-syntax, @typescript-eslint/no-unsafe-declaration-merging
		class ComponentBase extends (BaseElement as unknown as new() => object) { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
			static readonly elName = Component.elName;
			static readonly find = Component.find;
			static readonly findAll = Component.findAll;
			static readonly observedAttributes = Component.observedAttributes;
			static readonly propertyNamesByAttribute = Component.propertyNamesByAttribute;
			static readonly selector = Component.selector;
			static readonly tagName = tagName;

			constructor() {
				super();
				this.setAttribute(Component.const.attrEl, this.Ctor.elName);
				this.onConstruct();
			}
		}

		const instanceProperties = Object.getOwnPropertyDescriptors(Component.prototype);
		for (const instancePropertyName in instanceProperties) { // Note that this includes _prototype_ properties, but not _instance_ properties: https://stackoverflow.com/q/77733619/2053389
			const instanceProperty = instanceProperties[instancePropertyName];
			Object.defineProperty(ComponentBase.prototype, instancePropertyName, instanceProperty);
		}

		return ComponentBase as typeof BaseElement & typeof ComponentBase;
	}

	/**
	 * Defines a custom web component
	 * @param options.elName The name that will be used for the component, e.g. `app-foo`
	 * @param options.style The stylesheet that will be attached to the document the first time the component is used. `:host` will be replaced with the component's selector.
	 */
	static define<Subclass extends ComponentWithoutDecorators>(
		options: Partial<{
			elName: string;
			style: string;
		}> = {}
	) {
		return function(Subclass: Subclass) {
			const Constructor = Subclass as unknown as typeof Component;
			const elName = options.elName ?? Constructor.elName ?? `l-${Constructor.name.toLowerCase()}`;

			const selector = Constructor.tagName === undefined
				? elName
				: `[${Component.const.attrEl}='${elName}']`;
			const style = options.style?.replace(/::?host/g, selector);
			if ( // Has to come after elName has been assigned
				typeof style === `string`
				&& document.head.querySelector(`[${Component.const.styleAttr}='${elName}']`) === null
			) {
				const $style = document.createElement(`style`);
				$style.textContent = style;
				$style.setAttribute(Component.const.styleAttr, elName);
				document.head.appendChild($style);
			}

			Object.assign(Constructor, {
				elName,
				selector,
				style,
			});

			globalThis.customElements.define( // This should come last because when a custom element is defined its constructor runs for all instances on the page
				elName,
				Constructor,
				Subclass.tagName === undefined ? undefined : { extends: Subclass.tagName }
			);
		};
	}

	/**
	 * Decorates a method so that when the method is called it emits a DOM CustomEvent with the method's name, the `detail` of which is the method's return value
	 */
	static event<Value>(
		options = {} as CustomEventInit<Value>,
	) {
		const bubbles = options.bubbles ?? true;

		return function(
			target: Component,
			propertyName: string,
			descriptor: PropertyDescriptor,
		) {
			const transformer = descriptor.value as ((...args: any) => Value); // eslint-disable-line @typescript-eslint/no-explicit-any
			descriptor.value = function(
				this: Component,
				...args: Parameters<typeof transformer>
			) {
				const detail = transformer.call(this, ...args); // eslint-disable-line @typescript-eslint/no-unsafe-argument
				const event = new CustomEvent(propertyName.toLowerCase(), { // Has to be lowercase because it's stored in an HTML attribute
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
	 */
	static find<Subclass extends Component>(
		this: Constructor<Subclass>,
		root: Element = document.documentElement,
	) {
		const selector = (this as unknown as typeof Component).selector;
		return root.querySelector(selector) as Subclass;
	}

	/**
	 * Returns all elements in the document that match this constructor type
	 */
	static findAll<Subclass extends Component>(
		this: Constructor<Subclass>,
		root: Element = document.documentElement,
	) {
		const selector = (this as unknown as typeof Component).selector;
		return [...root.querySelectorAll(selector)] as Array<Subclass>;
	}

	/**
	 * For handling events via event delegation. When an event is received, this calls the intended object/method with the event payload
	 */
	static relay(event: Event) {
		const trigger = event.target as Element;
		const paramsAttr = `${Component.const.attrEmit}${event.type}-`;
		const attrEmitDelimiter = Component.const.attrEmitDelimiter;
		for (const attribute of trigger.attributes) {
			if (attribute.name.startsWith(paramsAttr)) {
				const [
					listenerId,
					handlerKey,
					...args
				] = attribute.value.split(attrEmitDelimiter);
				const listener = document.getElementById(listenerId);
				(listener as unknown as {
					[key: typeof handlerKey]: (event: Event, ...params: typeof args) => unknown;
				})[handlerKey](event, ...args);
			}
		}
	}

	/**
	 * Returns a pseudo (very-pseudo) random HTMLElement ID
	 * @see {@link newUid}
	 */
	static uid() {
		return `l${newUid()}`;
	}

	/**
	 * Emitter that emits on attributeChangedCallback
	 * @see {@link attributeChangedCallback}
	 */
	readonly attributeChanged!: Emitter<{ // TODO3: Stronger typing
		name: string;
		previous: unknown;
		value: unknown;
	}>;

	/**
	 * Stores the component's textual content, if any, which can be inserted into the component's template
	 */
	content: string | undefined = ``;

	/**
	 * @returns The instance's constructor
	 */
	get Ctor() {
		return this.constructor as typeof Component;
	}

	/**
	 * Emitter that emits on disconnectedCallback
	 * @see {@link disconnectedCallback}
	 */
	readonly disconnected!: Emitter<void>;

	readonly findDownCache!: Map<string, Array<HTMLElement>>;
	readonly findUpCache!: Map<string, HTMLElement>;

	constructor() {
		super();
		this.onConstruct();
	}

	/**
	 * Called when the component is attached to a new document
	 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
	 */
	adoptedCallback() {}

	/**
	 * Returns an Emitter that emits when the specified attribute changes
	 */
	attribute<
		AttributeName extends keyof this,
		Value extends this[AttributeName] = this[AttributeName],
	>(attributeName: AttributeName) {
		const emitter = this.attributeChanged.pipe(
			pipeFilter(({ name }) => name === attributeName)
		);
		return emitter as unknown as Emitter<{
			name: AttributeName;
			previous: Value;
			value: Value;
		}>;
	}

	/**
	 * Called when one of the properties decorated with `@Component.attribute` is modified
	 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
	 */
	attributeChangedCallback(
		name: string, // Not strongly typing this because that makes it annoying to subclass
		previous: unknown,
		value: unknown,
	) {
		this.attributeChanged.set({
			name: name,
			previous,
			value,
		});
		this.attributeChanged.set({
			name: Component.propertyNamesByAttribute[name],
			previous,
			value,
		});
	}

	/**
	 * Called when the component is attached to the DOM
	 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
	 */
	connectedCallback() {}

	/**
	 * Applies the given CSS rules to the Component's `style` attribute
	 */
	css(input: Partial<CSSStyleDeclaration>) {
		return style(this, input) as this;
	}

	/**
	 * Called when the component is detached from the DOM
	 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
	 */
	disconnectedCallback() {
		this.disconnected.set();
	}

	/**
	 * Looks for and returns the first instance of the specified constructor or selector within the current component's template
	 * @param options.all Returns all instances
	 */
	findDown<
		Select extends Constructor<Component>,
		Descendant extends InstanceType<Select>,
	>(select: Select): () => Descendant;
	findDown<
		Select extends Constructor<Component>,
		Descendant extends InstanceType<Select>,
	>(select: Select, options: { all: true; }): () => Array<Descendant>;
	findDown<
		Select extends keyof HTMLElementTagNameMap,
		Descendant extends HTMLElementTagNameMap[Select],
	>(select: Select): () => Descendant;
	findDown<
		Select extends keyof HTMLElementTagNameMap,
		Descendant extends HTMLElementTagNameMap[Select],
	>(selector: Select, options: { all: true; }): () => Array<Descendant>;
	findDown(select: string): () => HTMLElement;
	findDown(select: string, options: { all: true; }): () => Array<HTMLElement>;
	findDown(select: Function | string, options: Partial<{
		all: boolean;
	}> = {}) {
		const selector = (select as Function) === Page
			? `[${Page.$pageAttr}]`
			: typeof select === `string`
				? select
				: (select as unknown as typeof Component).selector;

		const isAll = options.all ?? false;

		return () => { // TODO3: What arguments would be helpful?
			const results = this.findDownCache.get(selector)
				?? [...this.querySelectorAll(selector)];
			this.findDownCache.set(selector, results as Array<HTMLElement>);
			return isAll ? results : results[0];
		};
	}

	/**
	 * Looks for and returns the nearest instance of the specified constructor among the current component's ancestors
	 */
	findUp<
		Select extends keyof HTMLElementTagNameMap,
	>(select: Select): () => HTMLElementTagNameMap[Select];
	findUp<
		Select extends Component,
	>(select: Constructor<Select>): () => Select;
	findUp(select: string): () => HTMLElement;
	findUp(select: Function | string) {
		const selector = (select as Function) === Page
			? `[${Page.$pageAttr}]`
			: typeof select === `string`
				? select
				: (select as unknown as typeof Component).selector;

		return () => { // TODO3: What arguments would be helpful?
			const result = this.findUpCache.get(selector) ?? this.closest(selector);
			this.findUpCache.set(selector, result as HTMLElement);
			return result;
		};
	}

	/**
	 * On the given event, calls the specified handler on the specified listener (or, if none specified, on `this`)
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
	on<
		Emitter extends Record<EventName, (...args: any) => void>, // eslint-disable-line @typescript-eslint/no-explicit-any
		EventName extends PropertyKey,
		EventDetail extends ReturnType<Emitter[EventName]>,
		EventType extends CustomEvent<EventDetail>,
		Listener extends Record<HandlerKey, (event: EventType, ...args: Args) => void>,
		HandlerKey extends PropertyKey,
		Args extends Array<number | string>,
	>(
		this: Emitter,
		eventName: EventName,
		listener: Listener,
		handlerKey: HandlerKey,
		...args: Args
	): Emitter;
	on(
		this: Component,
		eventName: string,
		handlerKeyOrListener: Component | string,
		...args: Array<number | string>
	): Component | string {
		let handlerKey: string;
		let handlerArgs: Array<unknown>;
		let listener: Component;
		if (typeof handlerKeyOrListener === `string`) {
			listener = this;
			handlerKey = handlerKeyOrListener;
			handlerArgs = args;
		} else {
			listener = handlerKeyOrListener;
			handlerKey = args[0] as string;
			handlerArgs = args.slice(1);
		}

		listener.id = listener.id === `` ? Component.uid() : listener.id;

		const eventNameNormalized = eventName.toLowerCase();
		document.body.setAttribute(`${Component.const.relayAttr}${eventNameNormalized}`, ``);
		document.body.addEventListener(eventNameNormalized, Component.relay);

		const params = [
			listener.id, // `setAttribute` downcases the id in the param name, so need to include it here too
			handlerKey,
			...handlerArgs,
		].join(Component.const.attrEmitDelimiter);
		const paramsAttr = `${Component.const.attrEmit}${eventNameNormalized}-${listener.id}`;

		if (typeof handlerKeyOrListener === `string`) { // It's a standard DOM element, not a Component
			return `${paramsAttr}="${params}"`;
		}

		this.setAttribute(paramsAttr, params);
		return this;
	}

	/**
	 * Called by the constructor. Needed because customized and autonomous components have different constructors.
	 * Would prefer this to be private, but TS won't emit the declaration if it is https://github.com/microsoft/TypeScript/issues/30355
	 */
	onConstruct() {
		Object.assign(this, {
			attributeChanged: new Emitter(), // Why here instead of declared as property? Because when attributes are set in the constructor it still calls `attributeChangedCallback`
			disconnected: new Emitter(),
			findDownCache: new Map(),
			findUpCache: new Map(),
		});
	}

	/**
	 * Called when the component finishes rendering
	 */
	onRender() {}

	/**
	 * Makes the component replace its contents with newly-rendered contents
	 */
	render(rootSelector?: string) {
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

			if (!(target instanceof HTMLElement)) {
				target = iterator.nextNode();
				continue;
			}

			if (sourceRoot === undefined) {
				if (rootSelector !== undefined && target.matches(rootSelector)) {
					sourceRoot = target;
				}
			}

			const targetIsInSourceRoot = (
				sourceRoot !== undefined && sourceRoot.contains(target) // TODO3: Can probably optimize this to not need to call `.contains` each time
			);

			if (treeIsInSourceRoot && !targetIsInSourceRoot) { // The current tree was in sourceRoot, now it's not, so assume we've exited sourceRoot and shouldn't process further
				break;
			}

			treeIsInSourceRoot = targetIsInSourceRoot;

			const tagName = target.tagName.toUpperCase();

			if (tagName === `PLACEHOLDER`) {
				const placeholder = target as HTMLUnknownElement;
				const id = placeholder.id;
				const cached = Component.cache.get(id)!.deref()!;
				cached.innerHTML = cached.template();
				Component.cache.delete(id);
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
		this.onRender();
		return this;
	}

	/**
	 * Sets multiple attributes or properties
	 */
	set(attributes: Partial<ElAttributes<this>>) {
		setAttributes(this, attributes);
		return this;
	}

	/**
	 * Subscribe to the given emitter while unsubscribing when the Component is disconnected
	 */
	subscribe<State>(emitter: Emitter<State>, doWhat: SubscriptionHandler<State>) {
		return emitter.pipe(pipeUntil(this.disconnected)).subscribe(doWhat);
	}

	/**
	 * Defines what is written into the document when this instance is rendered
	 */
	template(subclassTemplate?: string) {
		return subclassTemplate ?? this.content ?? ``;
	}

	/**
	 * Returns a placeholder element that will be hydrated into the full component during rendering.
	 */
	toString() {
		const tempId = this.id === `` ? Component.uid() : this.id;
		Component.cache.set(tempId, new WeakRef(this));
		return `<placeholder id="${tempId}"></placeholder>`;
	}

	/**
	 * A shortcut for setting the component's `content` property.
	 */
	write(input: string) {
		this.content = input;
		return this;
	}
}

export class Page extends Component.custom(`main`) {
	static $pageAttr = `data-page-title`;
	@Component.attribute({ name: Page.$pageAttr }) pageTitle!: string;

	constructor(input: Partial<{
		title: Page[`pageTitle`];
	}> = {}) {
		super();
		if (input.title !== undefined) {
			this.pageTitle = input.title;
		}
	}
}
