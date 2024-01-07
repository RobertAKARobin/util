import { appContext } from '@robertakarobin/util/context.ts';
import { findCommentsByContents } from '@robertakarobin/util/findComment.ts';
import { indexOn } from '@robertakarobin/util/indexOn.ts';
import { newUid } from '@robertakarobin/util/uid.ts';

export { css, html } from '@robertakarobin/util/template.ts';

type Constructor<Classtype> = new (...args: any) => Classtype; // eslint-disable-line @typescript-eslint/no-explicit-any

const globalProperty = `El`;
const globalVars = globalThis as typeof globalThis & {
	[globalProperty]: Record<string, unknown>;
};
globalVars[globalProperty] = {};

type AttributeValue = string | number | boolean | undefined | null | symbol;

type ComponentWithoutGlobals = Omit<typeof Component,
	| `$elAttr`
	| `$elDynamicAttrs`
	| `$elDynamicContent`
	| `$elDynamicList`
	| `$styleAttr`
	| `attribute`
	| `createId`
	| `custom`
	| `define`
	| `event`
	| `subclasses`
	| `unconnectedElements`
>;

export class Component extends HTMLElement {
	static readonly $elAttr = `is`;
	static readonly $elDynamicAttrs = `data-dynamic-attrs`;
	static readonly $elDynamicContent = `data-dynamic-content`;
	static readonly $elDynamicList = `data-dynamic-list`;
	static readonly $styleAttr = `data-style`;
	static readonly elName: string;
	static readonly observedAttributes = [] as Array<string>;
	static readonly selector: string;
	static readonly subclasses = new Set<typeof Component>();
	static readonly tagName?: keyof HTMLElementTagNameMap;
	static readonly unconnectedElements = new Map<HTMLElement[`id`], WeakRef<Component>>();

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
				set(this: Component, value: AttributeValue) {
					this.setAttributes({ [attributeName]: value });
				},
			});
		};
	}

	static createId() {
		return `l${newUid()}`;
	}

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
			static readonly get = Component.get;
			static readonly observedAttributes = [] as Array<string>;
			static readonly selector: string;
			static readonly tagName = tagName;

			constructor(...args: Array<any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
				super();
				this.onConstruct(...args); // eslint-disable-line @typescript-eslint/no-unsafe-argument
			}
		}

		const instanceProperties = Object.getOwnPropertyDescriptors(Component.prototype);
		for (const instancePropertyName in instanceProperties) { // Note that this includes _prototype_ properties, but not _instance_ properties: https://stackoverflow.com/q/77733619/2053389
			const instanceProperty = instanceProperties[instancePropertyName];
			Object.defineProperty(ComponentBase.prototype, instancePropertyName, instanceProperty);
		}

		return ComponentBase;
	}

	static define<Subclass extends ComponentWithoutGlobals>(
		options: Partial<{
			elName: string;
			style: string;
		}> = {}
	) {
		return function(Subclass: Subclass) {
			const Constructor = Subclass as unknown as typeof Component;
			const elName = options.elName ?? Constructor.elName ?? `l-${Constructor.name.toLowerCase()}`;

			const selector = `[${Component.$elAttr}='${elName}']`;
			const style = options.style?.replace(/::?host/g, selector);
			if ( // Has to come after elName has been assigned
				typeof style === `string`
				&& document.querySelector(`[${Component.$styleAttr}='${elName}']`) === null
			) {
				const $style = document.createElement(`style`);
				$style.textContent = style;
				$style.setAttribute(Component.$styleAttr, elName);
				document.head.appendChild($style);
			}

			Object.assign(Constructor, {
				elName,
				selector,
				style,
			});

			globalVars[globalProperty][Constructor.name] = Constructor;

			Component.subclasses.add(Constructor as unknown as typeof Component);

			globalThis.customElements.define( // This should come last because when a custom element is defined its constructor runs for all instances on the page
				elName,
				Constructor,
				Subclass.tagName === undefined ? undefined : { extends: Subclass.tagName }
			);
		};
	}

	static event(options: Partial<{
		bubbles: boolean;
		name: string;
	}> = {}) {
		return function(
			target: Component,
			propertyName: string,
			descriptor: PropertyDescriptor,
		) {
			const eventName = options.name ?? propertyName;
			const eventDetailFormatter = descriptor.value as Function;
			descriptor.value = function(this: Component, ...args: Array<unknown>) {
				const detail = eventDetailFormatter.call(this, ...args) as unknown;
				this.dispatchEvent(new CustomEvent(eventName, {
					bubbles: options.bubbles ?? true,
					detail,
				}));
			};
		};
	}

	static find<Subclass extends Component>(
		this: Constructor<Subclass>,
		root: Element = document.documentElement,
	) {
		const selector = (this as unknown as typeof Component).selector;
		return root.querySelector(selector) as Subclass;
	}

	static findAll<Subclass extends Component>(
		this: Constructor<Subclass>,
		root: Element = document.documentElement,
	) {
		const selector = (this as unknown as typeof Component).selector;
		return [...root.querySelectorAll(selector)] as Array<Subclass>;
	}

	static get<Subclass extends Component>(
		this: Constructor<Subclass>,
		id?: Component[`id`],
	) {
		if (id === undefined) {
			return new this();
		}

		const $existing = document.getElementById(id) as Subclass;
		if ($existing !== null) {
			return $existing;
		}

		return new this(id);
	}

	/**
	 * Content that will be rendered inside this element.
	 */
	content = `` as string | undefined | null;
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

	constructor(...args: Array<any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
		super();
		this.onConstruct(...args); // eslint-disable-line @typescript-eslint/no-unsafe-argument
	}

	protected adoptedCallback() {}

	protected attributeChangedCallback(
		attributeName: string,
		oldValue: string,
		newValue: string,
	) {
		this.onChange(attributeName, oldValue, newValue);
	}

	bind<
		Self extends Record<EventName, (...args: any) => any>, // eslint-disable-line @typescript-eslint/no-explicit-any
		EventName extends keyof Self,
	>(
		this: Self,
		methodKey: EventName,
	) {
		const methodName = methodKey as string;
		return `this.closest(\`${(this as unknown as Component).Ctor.selector}\`).${methodName}(event)`;
	}

	protected connectedCallback() {
		this.onPlace();
	}

	protected disconnectedCallback() {
		this.onRemove();
	}

	dynamicAttrs(...attrs: Array<string>) {
		return ` ${Component.$elDynamicAttrs}="${attrs.join(`,`)}" `;
	}

	dynamicContent() {
		return ` ${Component.$elDynamicContent} `;
	}

	dynamicList(id: string, els: Array<HTMLElement>) {
		return `<!--${id}-->` + els.map(element => {
			element.setAttribute(Component.$elDynamicList, id);
			return element;
		}).join(``);
	}

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
		EventDetailGetter extends Self[EventName],
		EventDetail extends ReturnType<EventDetailGetter>,
	>(
		this: Self,
		eventKey: EventName,
		doWhat: (event: CustomEvent<EventDetail>) => void
	) {
		const eventName = eventKey.toString();
		(this as unknown as HTMLElement).addEventListener(eventName, doWhat as EventListener);
		return this;
	}

	onChange(
		_attributeName: string,
		_oldValue: string,
		_newValue: string,
	) {}

	private onConstruct(...args: Array<any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
		const id = typeof args[0] === `string` ? args[0] : undefined;
		this.id = (id ?? this.getAttribute(`id`) ?? Component.createId()); // If an element has no ID, this.id is empty string, and this.getAttribute(`id`) is null
		this.setAttribute(Component.$elAttr, this.Ctor.elName);
	}

	/**
	 * Called when the instance's element is attached to or moved within a document
	 */
	onPlace() {}

	/**
	 * Called when the instance's element is removed from a document
	 */
	onRemove() {}

	render() {
		const template = document.createElement(`template`);
		template.innerHTML = this.template();

		const newCommentIterator = () => document.createNodeIterator(
			template.content,
			NodeFilter.SHOW_COMMENT,
			() => NodeFilter.FILTER_ACCEPT,
		);
		let iterator = newCommentIterator();
		let $placeholder: Comment;
		while (true) {
			$placeholder = iterator.nextNode() as Comment;

			if ($placeholder === null) {
				break;
			}

			const id = $placeholder.textContent!;
			const el = Component.unconnectedElements.get(id)?.deref();
			if (el !== undefined) {
				if (el.innerHTML === ``) {
					el.innerHTML = el.template(); // Flipping the order of these two lines seems to make the $el 'adopted' an extra time
				}
				$placeholder.replaceWith(el);

				if (appContext !== `browser`) {
					iterator = newCommentIterator();
				}
			}
			Component.unconnectedElements.delete(id);
		}

		this.replaceChildren(...template.content.childNodes);

		return this;
	}

	rerender() {
		const template = document.createElement(`template`);
		template.innerHTML = this.template();

		this.rerenderLists(template);
		this.rerenderAttributes(template);
		this.rerenderContents(template);

		return this;
	}

	private rerenderAttributes(template: HTMLTemplateElement) {
		const updatedEls = template.content.querySelectorAll(`[${Component.$elDynamicAttrs}]`);
		const existingEls = this.querySelectorAll(`[${Component.$elDynamicAttrs}]`);
		const existingElsById = indexOn(existingEls, `id`);
		for (const updatedEl of updatedEls) {
			const attributeNames = updatedEl.getAttribute(Component.$elDynamicAttrs)!.split(`,`);
			const id = updatedEl.id;
			const existingEl = existingElsById[id];
			for (const attributeName of attributeNames) {
				const value = updatedEl.getAttribute(attributeName)!;
				existingEl.setAttribute(attributeName, value);
			}
		}
	}

	private rerenderContents(template: HTMLTemplateElement) {
		const updatedEls = template.content.querySelectorAll(`[${Component.$elDynamicContent}]`);
		const existingEls = this.querySelectorAll(`[${Component.$elDynamicContent}]`);
		const existingElsById = indexOn(existingEls, `id`);
		for (const updatedEl of updatedEls) {
			const id = updatedEl.id;
			const existingEl = existingElsById[id];
			existingEl.innerHTML = updatedEl.innerHTML;
		}
	}

	private rerenderLists(template: HTMLTemplateElement) {
		const updatedEls = template.content.querySelectorAll(`[${Component.$elDynamicList}]`);
		const existingEls = this.querySelectorAll(`[${Component.$elDynamicList}]`) as Iterable<HTMLElement>;
		const existingElsById = indexOn(existingEls, `id`);
		const elsToRemove = new Set(existingEls);
		const elStartsById = {} as Record<string, Node>;
		for (const updatedEl of updatedEls) {
			const id = updatedEl.id;
			const elStart = elStartsById[id] ?? (
				elStartsById[id] = findCommentsByContents(this, id)[0]
			);

			const existingEl = existingElsById[id];
			elStart.parentElement!.insertBefore(
				existingEl ?? updatedEl,
				elStart
			);

			elsToRemove.delete(existingEl);
		}

		for (const elToRemove of elsToRemove) {
			elToRemove.remove();
		}
	}

	set(attributes: Partial<this>) {
		for (const attributeName in attributes) {
			const attributeKey = attributeName as keyof this;
			this[attributeKey] = attributes[attributeKey]!;
		}
		return this;
	}

	setAttributes(attributes: Record<string, AttributeValue>) {
		for (const attributeName in attributes) {
			const value = attributes[attributeName];
			if (value === undefined || value === null || value === `undefined` || value === `null` || value === ``) {
				this.removeAttribute(attributeName);
			} else {
				this.setAttribute(attributeName, attributes[attributeName]!.toString());
			}
		}
		return this;
	}

	/**
	 * Defines what is written into the document when this instance is rendered
	 */
	template(subclassTemplate?: string) {
		return subclassTemplate ?? this.content ?? ``;
	}

	toString() {
		Component.unconnectedElements.set(this.id, new WeakRef(this));
		return `<!--${this.id}-->`;
	}

	/**
	 * Set the inner content of the element.
	 */
	write(content: string | undefined | null) {
		this.content = content;
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

	protected connectedCallback() {
		document.title = this.pageTitle;
		super.connectedCallback();
	}
}
