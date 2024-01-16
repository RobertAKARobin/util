import {
	attributeValueIsEmpty,
	type ElAttributes,
	getAttributes,
	setAttributes,
} from '@robertakarobin/util/attributes.ts';
import { enumy } from '@robertakarobin/util/enumy.ts';
import { newUid } from '@robertakarobin/util/uid.ts';
import { serialize } from '@robertakarobin/util/serialize.ts';
import type { Textish } from '@robertakarobin/util/types.d.ts';

type Constructor<Classtype> = new (...args: any) => Classtype; // eslint-disable-line @typescript-eslint/no-explicit-any

export const subclasses = new Map<string, typeof Component>();

type ComponentWithoutDecorators = Omit<typeof Component,
	| `attribute`
	| `const`
	| `custom`
	| `define`
	| `event`
>;

const componentCache = new Map<string, WeakRef<Component>>();

export type RenderMode = keyof typeof Component.const.renderMode;

export class Component extends HTMLElement {
	static readonly const = {
		attrEl: `is`,
		attrRender: `data-render`,
		flagEl: `el:`,
		renderMode: enumy(
			`static`,
			`attr`,
			`inner`,
			`outer`,
			`el`,
		),
		styleAttr: `data-style`,
	} as const;
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
	static custom<
		TagName extends keyof HTMLElementTagNameMap,
	>(tagName: TagName) {
		const $dummy = document.createElement(tagName);
		const BaseElement = $dummy.constructor as Constructor<HTMLElementTagNameMap[TagName]>;

		interface ComponentBase extends Component {} // eslint-disable-line no-restricted-syntax, @typescript-eslint/no-unsafe-declaration-merging
		class ComponentBase extends (BaseElement as unknown as new() => object) { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
			static readonly elName: string;
			static readonly find = Component.find;
			static readonly findAll = Component.findAll;
			static readonly observedAttributes = [] as Array<string>;
			static readonly selector: string;
			static readonly tagName = tagName;

			constructor(id?: Component[`id`]) {
				super();
				this.onConstruct(id);
			}
		}

		const instanceProperties = Object.getOwnPropertyDescriptors(Component.prototype);
		for (const instancePropertyName in instanceProperties) { // Note that this includes _prototype_ properties, but not _instance_ properties: https://stackoverflow.com/q/77733619/2053389
			const instanceProperty = instanceProperties[instancePropertyName];
			Object.defineProperty(ComponentBase.prototype, instancePropertyName, instanceProperty);
		}

		return ComponentBase as typeof ComponentBase & typeof BaseElement;
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

			const selector = `[${Component.const.attrEl}='${elName}']`;
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
	content: string | undefined = ``;

	/**
	 * @returns The instance's constructor
	 */
	get Ctor() {
		return this.constructor as typeof Component;
	}

	isRendered = false;

	/**
	 * If true, if this is a Page it will be compiled into a static `.html` file at the route(s) used for this Page, which serves as a landing page for performance and SEO purposes.
	 * If this is a Component it will be compiled into static HTML included in the landing page.
	 * Not a static variable because a Component/Page may/may not want to be SSG based on certain conditions
	*/
	readonly isSSG: boolean = true;

	constructor(id?: Component[`id`]) {
		super();
		this.onConstruct(id);
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

	private onConstruct(id?: Component[`id`]) {
		if (id !== undefined) {
			this.id = id;
		}
		this.setAttribute(Component.const.attrEl, this.Ctor.elName);
	}

	/**
	 * Makes the component replace its contents with newly-rendered contents
	 */
	render(options: Partial<{ renderMode: RenderMode; }> = {}) {
		const template = document.createElement(`template`);
		template.innerHTML = this.template();

		const root = template.content.firstElementChild!;
		if (root?.tagName.toUpperCase() === `HOST`) {
			const updatedAttributes = {
				...getAttributes(this),
				...getAttributes(root as HTMLUnknownElement),
			} as Partial<ElAttributes<this>>;
			this.set(updatedAttributes);
			root.replaceWith(...root.childNodes);
		}

		const iterator = document.createTreeWalker(
			template.content,
			NodeFilter.SHOW_COMMENT + NodeFilter.SHOW_ELEMENT,
			() => NodeFilter.FILTER_ACCEPT,
		);
		let target: Comment | HTMLElement;
		while (true) {
			target = iterator.nextNode()! as Comment | HTMLElement;

			if (target === null) {
				break;
			}

			if (target instanceof Comment) {
				const placeholder = target;
				const flag = placeholder.textContent!;
				if (flag.startsWith(Component.const.flagEl)) {
					const tempId = flag.substring(Component.const.flagEl.length);
					const cached = componentCache.get(tempId)!.deref()!;
					componentCache.delete(tempId);
					iterator.previousNode();
					placeholder.replaceWith(cached);
				}
				continue;
			}

			const isComponent = target.hasAttribute(Component.const.attrEl);
			if (isComponent) {
				const instance = (target as Component);
				if (!instance.isRendered) {
					instance.render();
				}
			}

			if (!this.isRendered) {
				continue;
			}

			const id = target.id;
			if (id === ``) {
				continue;
			}

			const existing = document.getElementById(id);

			if (existing === null) {
				continue;
			}

			const renderMode = target.getAttribute(Component.const.attrRender) as RenderMode
				?? Component.const.renderMode.outer;

			if (renderMode === `static`) {
				continue;
			}

			if (renderMode !== `inner`) {
				setAttributes(existing, getAttributes(target));
			}

			if (renderMode === `inner` || renderMode === `outer`) {
				existing.replaceChildren(...target.childNodes);
			} else if (renderMode === `el`) {
				existing.replaceWith(target);
			}
		}

		if (!this.isRendered || [`outer`, `inner`].includes(options.renderMode ?? ``)) {
			this.replaceChildren(...template.content.childNodes);
		}

		if (!this.isRendered) {
			this.isRendered = true;
		}

		return this;
	}

	/**
	 * Sets multiple attributes or properties.
	 */
	set(attributes: Partial<ElAttributes<this>>) {
		for (const attributeName in attributes) {
			const attributeKey = attributeName as keyof ElAttributes<this>;

			const value = attributes[attributeKey] as Textish;
			if (attributeKey === `class`) {
				this.setAttribute(`class`, value as string);
			} else {
      	this[attributeKey] = value as this[typeof attributeKey]; // This triggers the setter which removes empty attributes
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
		const tempId = [undefined, null, ``].includes(this.id) ? newUid() : this.id;
		componentCache.set(tempId, new WeakRef(this));
		return `<!--${Component.const.flagEl}${tempId}-->`;
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
		this.id = `app-page`;
		this.setAttribute(Component.const.attrRender, `el`);
		if (input.title !== undefined) {
			this.pageTitle = input.title;
		}
	}
}
