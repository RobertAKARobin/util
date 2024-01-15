import {
	attributeValueIsEmpty,
	getAttributes,
	setAttributes,
} from '@robertakarobin/util/attributes.ts';
import { appContext } from '@robertakarobin/util/context.ts';
import { newUid } from '@robertakarobin/util/uid.ts';
import { serialize } from '@robertakarobin/util/serialize.ts';
import type { Textish } from '@robertakarobin/util/types.d.ts';

type Constructor<Classtype> = new (...args: any) => Classtype; // eslint-disable-line @typescript-eslint/no-explicit-any

const Const = {
	attrDynamic: `data-dynamic`,
	attrEl: `is`,
	flagEl: `el:`,
	globalProperty: `El`,
	styleAttr: `data-style`,
} as const;

export const subclasses = new Map<string, typeof Component>();

const globalVars = globalThis as typeof globalThis & {
	[Const.globalProperty]: Record<string, unknown>;
};
globalVars[Const.globalProperty] = {};

type ComponentWithoutDecorators = Omit<typeof Component,
	| `attribute`
	| `custom`
	| `define`
	| `event`
>;

const componentCache = new Map<string, WeakRef<Component>>();

export class Component extends HTMLElement {
	static readonly elName: string;
	static readonly observedAttributes = [] as Array<string>;
	static readonly selector: string;
	static readonly tagName?: keyof HTMLElementTagNameMap;

	/**
	 * Defines a property that will be exposed as an HTML element in the DOM
	 * @param options.name The name that will be used for the attribute. If not specified, the property name will be used, downcased and prefixed with `l-`
	 */
	static attribute(options: Partial<{
		name: string;
	}> = {}) {
		// typeof defaultValue === `number` ? Number
		// 	: typeof defaultValue === `boolean` ? Boolean
		// 		: (input: string) => (
		// 			input === null ? null
		// 				: input === undefined ? undefined
		// 					: input === `` ? undefined
		// 						: input
		// 		)
		return function(
			target: Component,
			propertyName: string,
		) {
			const attributeName = options?.name ?? propertyName;
			const Constructor = target.constructor as typeof Component;
			Constructor.observedAttributes.push(attributeName);

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
							(value as Exclude<Textish, undefined | null>).toString()
						);
					}
				},
			});
		};
	}

	/**
	 * Adds common component methods/helpers to the specified HTML element constructor
	 */
	static custom(tagName: keyof HTMLElementTagNameMap) {
		const $dummy = document.createElement(tagName);
		const BaseElement = $dummy.constructor as Constructor<
			HTMLElementTagNameMap[keyof HTMLElementTagNameMap]
		>;

		interface ComponentBase extends Component {} // eslint-disable-line no-restricted-syntax, @typescript-eslint/no-unsafe-declaration-merging
		class ComponentBase extends (BaseElement as typeof HTMLElement) { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
			static readonly elName: string;
			static readonly find = Component.find;
			static readonly findAll = Component.findAll;
			static readonly observedAttributes = [] as Array<string>;
			static readonly selector: string;
			static readonly tagName = tagName;

			constructor() {
				super();
				this.onConstruct();
			}
		}

		const instanceProperties = Object.getOwnPropertyDescriptors(Component.prototype);
		for (const instancePropertyName in instanceProperties) { // Note that this includes _prototype_ properties, but not _instance_ properties: https://stackoverflow.com/q/77733619/2053389
			const instanceProperty = instanceProperties[instancePropertyName];
			Object.defineProperty(ComponentBase.prototype, instancePropertyName, instanceProperty);
		}

		return ComponentBase;
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

			const selector = `[${Const.attrEl}='${elName}']`;
			const style = options.style?.replace(/::?host/g, selector);
			if ( // Has to come after elName has been assigned
				typeof style === `string`
				&& document.head.querySelector(`[${Const.styleAttr}='${elName}']`) === null
			) {
				const $style = document.createElement(`style`);
				$style.textContent = style;
				$style.setAttribute(Const.styleAttr, elName);
				document.head.appendChild($style);
			}

			Object.assign(Constructor, {
				elName,
				selector,
				style,
			});

			globalVars[Const.globalProperty][Constructor.name] = Constructor;

			subclasses.set(Constructor.name, Constructor as unknown as typeof Component);

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
				const event = new CustomEvent(propertyName, {
					...options,
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
	 * Stores the component's textual content, if any, which can be inserted into the component's template
	 */
	content: string | undefined;

	/**
	 * @returns The instance's constructor
	 */
	get Ctor() {
		return this.constructor as typeof Component;
	}

	/**
	 * If true, if this is a Page it will be compiled into a static `.html` file at the route(s) used for this Page, which serves as a landing page for performance and SEO purposes.
	 * If this is a Component it will be compiled into static HTML included in the landing page.
	 * Not a static variable because a Component/Page may/may not want to be SSG based on certain conditions
	*/
	readonly isSSG: boolean = true;

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
	 * Called when one of the properties decorated with `@Component.attribute` is modified
	 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
	 */
	attributeChangedCallback<
		AttributeName extends keyof this,
		Value extends this[AttributeName],
	>(
		_attributeName: AttributeName,
		_oldValue: Value,
		_newValue: Value,
	) {}

	/**
	 * Returns a string that can be inserted into an element's `[on*]` attribute that will call the specified function
	 */
	bind<
		Self extends Record<MethodKey, (event: Event, ...args: any) => any>, // eslint-disable-line @typescript-eslint/no-explicit-any
		MethodKey extends keyof Self,
		Method extends Self[MethodKey],
		Args extends Parameters<Method>,
	>(
		this: Self,
		methodKey: MethodKey,
		...args: Partial<[Args[1], Args[2], Args[3]]> // TODO2: Why TF doesn't `...args: Args` work
	) {
		const methodName = methodKey as string;
		const argsString = args.length === 0 ? `` : `,${serialize(args).slice(1, -1)}`; // Removes leading/trailing brackets
		return `this.closest(\`${(this as unknown as Component).Ctor.selector}\`).${methodName}(event${argsString})`;
	}

	/**
	 * Called when the component is attached to the DOM
	 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
	 */
	connectedCallback() {}

	/**
	 * Called when the component is detached from the DOM
	 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
	 */
	disconnectedCallback() {}

	/**
	 * Looks for and returns the first instance of the specified constructor, or element of the specified selector, within the current component's template
	 */
	findDown<Descendant extends keyof HTMLElementTagNameMap>(
		Descendant: Descendant
	): HTMLElementTagNameMap[Descendant];
	findDown<Descendant>(Descendant: Constructor<Descendant>): Descendant;
	findDown<Descendant>(Descendant: keyof HTMLElementTagNameMap | Constructor<Descendant>) {
		if (typeof Descendant === `string`) {
			return this.querySelector(Descendant);
		}
		return this.querySelector(
			(Descendant as unknown as typeof Component).selector
		) as Descendant;
	}

	/**
	 * Looks for and returns all instances of the specified constructor, or all elements of the specified selector, within the current component's template
	 */
	findDownAll<Descendant extends keyof HTMLElementTagNameMap>(
		Descendant: Descendant
	): Array<HTMLElementTagNameMap[Descendant]>;
	findDownAll<Descendant>(Descendant: Constructor<Descendant>): Array<Descendant>;
	findDownAll<Descendant>(Descendant: keyof HTMLElementTagNameMap | Constructor<Descendant>) {
		if (typeof Descendant === `string`) {
			return [...this.querySelectorAll(Descendant)];
		}
		return [...this.querySelectorAll(
			(Descendant as unknown as typeof Component).selector
		)] as Array<Descendant>;
	}

	/**
	 * Looks for and returns the nearest instance of the specified constructor among the current component's ancestors
	 */
	findUp<Ancestor extends keyof HTMLElementTagNameMap>(
		Ancestor: Ancestor
	): HTMLElementTagNameMap[Ancestor];
	findUp<Ancestor>(Ancestor: Constructor<Ancestor>): Ancestor;
	findUp<Ancestor>(Ancestor: keyof HTMLElementTagNameMap | Constructor<Ancestor>) {
		if (typeof Ancestor === `string`) {
			return this.closest(Ancestor);
		}
		return this.closest((Ancestor as unknown as typeof Component).selector);
	}

	on<
		Self extends Record<EventName, (...args: any) => any>, // eslint-disable-line @typescript-eslint/no-explicit-any
		EventName extends keyof Self,
		EventDetail extends ReturnType<Self[EventName]>,
	>(
		this: Self,
		eventName: EventName,
		doWhat: (event: CustomEvent<EventDetail>) => void
	) {
		const self = (this as unknown as HTMLElement);
		self.addEventListener(
			eventName as string,
			doWhat as EventListener
		);
		return this;
	}

	private onConstruct() {
		this.id = [undefined, null, ``].includes(this.id) ? `l${newUid()}` : this.id;
		this.setAttribute(Const.attrEl, this.Ctor.elName);
	}

	/**
	 * Makes the component replace its contents with newly-rendered contents
	 */
	render() {
		// TODO1: Handle adding new elements
		// TODO1: Handle just changing attributes
		// TODO1: Handle nested content (slots?)
		const template = document.createElement(`template`);
		template.innerHTML = this.template();

		const templateRoot = template.content.firstElementChild!;
		if (templateRoot?.tagName.toUpperCase() === `HOST`) {
			this.set({
				...getAttributes(this) as Partial<this>,
				...getAttributes(templateRoot as HTMLUnknownElement),
			});
			templateRoot.replaceWith(...templateRoot.childNodes);
		}

		const newIterator = () => document.createTreeWalker(
			this.isConnected ? this : template.content,
			NodeFilter.SHOW_COMMENT + NodeFilter.SHOW_ELEMENT,
			() => NodeFilter.FILTER_ACCEPT,
		);
		let iterator = newIterator();
		let target: Comment | HTMLElement;
		while (true) {
			target = iterator.nextNode()! as Comment | HTMLElement;

			if (target === null) {
				break;
			}

			if (target instanceof Comment) {
				const placeholder = target;
				const flag = placeholder.textContent!;
				if (flag.startsWith(Const.flagEl)) {
					const id = flag.substring(Const.flagEl.length);
					const instance = componentCache.get(id)!.deref()!;
					componentCache.delete(id);

					placeholder.replaceWith(instance);

					instance.render();

					if (appContext === `build`) {
						iterator = newIterator();
					}
				}

			} else {
				if (!target.hasAttribute(`id`)) {
					continue;
				}

				if (!this.isConnected) {
					continue;
				}

				const id = target.id;
				const updated = template.content.getElementById(id)!;
				if (updated === undefined) {
					this.remove();
					continue;
				}

				target.innerHTML = updated.innerHTML;

				setAttributes(target, getAttributes(updated));
			}
		}

		if (!this.isConnected) {
			this.replaceChildren(...template.content.childNodes);
		}

		return this;
	}

	/**
	 * Sets multiple attributes or properties.
	 * If a value is a function and the property is also a function, this assumes the target is an event and adds the value as an event listener function.
	 */
	set(attributes: Partial<this>) {
		for (const attributeName in attributes) {
			const attributeKey = attributeName as keyof typeof this;

			let value = attributes[attributeKey] as Textish;

			if (typeof value === `function`) {
				const existing = this[attributeKey];
				if (typeof existing === `function`) { // Assume it's an event
					this.addEventListener(attributeName, value);
				} else {
					value = (value as Function)() as Textish;
				}
			}

			if (attributeKey === `class`) {
				this.setAttribute(`class`, value as string);
			} else {
				this[attributeKey] = value as typeof this[keyof this];
			}
		}
		return this;
	}

	/**
	 * Defines what is written into the document when this instance is rendered
	 */
	template(subclassTemplate?: string) {
		return subclassTemplate ?? this.innerHTML ?? ``;
	}

	toString() {
		componentCache.set(this.id, new WeakRef(this));
		return `<!--${Const.flagEl}${this.id}-->`;
	}

	write(input: string) {
		this.content = input;
		return this;
	}
}

export class Page extends Component.custom(`main`) {
	static $pageAttr = `data-page-title`;

	isSSG = true;
	@Component.attribute({ name: Page.$pageAttr }) pageTitle!: string;

	constructor(input: Partial<{
		title: Page[`pageTitle`];
	}> = {}) {
		super();
		if (input.title !== undefined) {
			this.pageTitle = input.title;
		}
	}

	connectedCallback() {
		super.connectedCallback();
		document.title = this.pageTitle;
	}
}
