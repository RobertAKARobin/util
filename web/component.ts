/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import { appContext } from '@robertakarobin/util/context.ts';
import { newUid } from '@robertakarobin/util/uid.ts';

export { html, css } from '@robertakarobin/util/template.ts';

type Constructor<Classtype> = new (...args: any) => Classtype; // eslint-disable-line @typescript-eslint/no-explicit-any

export type AttributeValue = string | number | symbol | undefined | null;

const globalProperty = `El`;
const globalVars = globalThis as typeof globalThis & {
	[globalProperty]: Record<string, unknown>;
};
globalVars[globalProperty] = {};

type ComponentWithoutGlobals = Omit<typeof Component,
	| `$elAttr`
	| `$styleAttr`
	| `subclasses`
	| `attribute`
	| `createId`
	| `custom`
	| `define`
	| `event`
	| `unconnectedElements`
>;

export class Component extends HTMLElement {
	static readonly $elAttr = `is`;
	static readonly $styleAttr = `data-style`;
	static readonly elName: string;
	static readonly observedAttributes = [] as Array<string>;
	static readonly selector: string;
	static readonly style: string | undefined;
	static readonly subclasses = new Set<typeof Component>();
	static readonly tagName?: keyof HTMLElementTagNameMap;
	static readonly unconnectedElements = new Map<HTMLElement[`id`], WeakRef<Component>>();

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
				set(this: Component, value: unknown) {
					this.setAttributes({ [attributeName]: value as string });
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

		interface ComponentBase extends Component {} // eslint-disable-line no-restricted-syntax
		class ComponentBase extends (BaseElement as typeof HTMLElement) {
			static readonly elName: string;
			static readonly observedAttributes = [] as Array<string>;
			static readonly selector: string;
			static readonly style: string | undefined;
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
		_options = {} // TODO3: Options?
	) {
		return function(Subclass: Subclass) {
			const Constructor = Subclass as unknown as typeof Component;
			const elName = Constructor.elName ?? `l-${Constructor.name.toLowerCase()}`;

			const selector = `[${Component.$elAttr}='${elName}']`;
			const style = Constructor.style?.replace(/::?host/g, selector);
			if ( // Has to come after elName has been assigned
				typeof style === `string`
				&& document.querySelector(`style[${Component.$styleAttr}='${elName}']`) === null
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

			// const BaseElement = document.createElement(tagName).constructor as Constructor<HTMLElement>;
			// for (const attributeName in observedAttributeDefinitions) {
			// 	const attributeDefinition = observedAttributeDefinitions[attributeName];
			// 	const defaultValue = attributeDefinition.default;
			// 	attributeDefinition.fromString = attributeDefinition.fromString ?? (
			// 		typeof defaultValue === `number` ? Number
			// 			: typeof defaultValue === `boolean` ? Boolean
			// 				: (input: string) => (
			// 					input === null ? null
			// 						: input === undefined ? undefined
			// 							: input === `` ? undefined
			// 								: input
			// 				)
			// 	);
			// }
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
			Object.defineProperty(target, propertyName, {
				...descriptor,
				value: function(this: Component, ...args: Array<unknown>) {
					const detail = eventDetailFormatter(...args) as unknown;
					this.dispatchEvent(new CustomEvent(eventName, {
						bubbles: options.bubbles ?? true,
						detail,
					}));
				},
			});
		};
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

		// if (id !== undefined) {
		// 	const $existing = document.getElementById(id);
		// 	if ($existing) {
		// 		return $existing as this;
		// 	}
		// }
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
		const $template = document.createElement(`template`);
		$template.innerHTML = this.template();

		const newCommentIterator = () => document.createNodeIterator(
			$template.content,
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
			const $el = Component.unconnectedElements.get(id)!.deref()!;
			Component.unconnectedElements.delete(id);

			if ($el.innerHTML === ``) {
				$el.innerHTML = $el.template(); // Flipping the order of these two lines seems to make the $el 'adopted' an extra time
			}
			$placeholder.replaceWith($el);

			if (appContext !== `browser`) {
				iterator = newCommentIterator();
			}
		}

		this.replaceChildren(...$template.content.childNodes);

		return this;
	}

	set(attributes: Partial<this>) {
		return this.setAttributes(attributes as Record<string, AttributeValue>);
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
	@Component.attribute() pageTitle = ``;

	constructor(input: {
		title: Page[`pageTitle`];
	}) {
		super();
		this.pageTitle = input.title ?? this.pageTitle;
	}

	onPlace() {
		document.title = this.pageTitle;
	}
}
