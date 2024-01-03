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

export type ObservedAttributeDefinition<Value = unknown> = {
	default: Value;
	fromString?: (input: string) => Value;
};

export type CustomElement = typeof HTMLElement & {
	observedAttributes: Array<string>;
};

export interface Component extends HTMLElement {} // eslint-disable-line no-restricted-syntax

export class Component {
	static readonly $elAttr = `is`;
	static readonly $styleAttr = `data-style`;
	static readonly elName: string;
	static readonly selector: string;
	static readonly style: string | undefined;
	static readonly subclasses = new Set<typeof Component>();
	static readonly tagName: string;
	static readonly unconnectedElements = new Map<HTMLElement[`id`], WeakRef<Component>>();

	static attribute(options: Partial<{
		name: string;
	}> = {}) {
		return function(target: Component, propertyName: string) {
			const attributeName = options?.name ?? propertyName;
			const Constructor = target.constructor as CustomElement;
			Constructor.observedAttributes = (Constructor.observedAttributes ?? []);
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

	static custom<
		TagName extends keyof HTMLElementTagNameMap,
		TagType extends HTMLElementTagNameMap[TagName],
	>(
		tagName: TagName,
		options: Partial<{
			elName: string;
		}> = {}
	) {
		const BaseElement = document.createElement(tagName).constructor as typeof HTMLElement;
		interface ComponentBase extends Component {} // eslint-disable-line no-restricted-syntax

		class ComponentBase extends BaseElement {
			static readonly elName = options.elName as string;
			static readonly observedAttributes = [] as Array<string>;
			static readonly selector: string;
			static readonly style: string | undefined;
			static readonly tagName = tagName;

			constructor(id?: ComponentBase[`id`]) {
				if (id !== undefined) {
					const $existing = document.getElementById(id);
					if ($existing) {
						return $existing as this;
					}
				}

				super();

				this.id = (id ?? this.getAttribute(`id`) ?? Component.createId()); // If an element has no ID, this.id is empty string, and this.getAttribute(`id`) is null
			}

			set(attributes: Partial<TagType | this>) {
				return this.setAttributes(attributes as Record<string, AttributeValue>);
			}
		}

		const instanceProperties = Object.getOwnPropertyDescriptors(this.prototype);
		for (const instancePropertyName in instanceProperties) { // Note that this includes _prototype_ properties, but not _instance_ properties: https://stackoverflow.com/q/77733619/2053389
			if (instancePropertyName === `constructor`) {
				continue;
			}
			const instanceProperty = instanceProperties[instancePropertyName];
			Object.defineProperty(ComponentBase.prototype, instancePropertyName, instanceProperty);
		}

		return ComponentBase as (typeof ComponentBase & {
			new(...args: Array<any>): TagType; // eslint-disable-line @typescript-eslint/no-explicit-any
		});
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

	static init<Subclass extends Constructor<Component> & Pick<typeof Component, `elName` | `style` | `tagName`>>(
		Constructor: Subclass
	) {
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

		globalThis.customElements.define(elName, Constructor, { extends: Constructor.tagName }); // This should come last because when a custom element is defined its constructor runs for all instances on the page

		Component.subclasses.add(Constructor as unknown as typeof Component);

		return function(...args: ConstructorParameters<typeof Constructor>) {
			const instance = new Constructor(...(args as unknown as [])) as InstanceType<Subclass>;
			return instance;
		};

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
	findDown(Descendant: string): HTMLElement;
	findDown<Descendant>(Descendant: Constructor<Descendant>): Descendant;
	findDown<Descendant>(Descendant: string | Constructor<Descendant>) {
		if (typeof Descendant === `string`) {
			return this.querySelector(Descendant) as HTMLElement;
		}
		return this.querySelector(
			(Descendant as unknown as typeof Component).selector
		) as Descendant;
	}

	/**
	 * Looks for and returns all instances of the specified constructor, or all elements of the specified selector, within the current component's template
	 */
	findDownAll(Descendant: string): Array<HTMLElement>;
	findDownAll<Descendant>(Descendant: Constructor<Descendant>): Array<Descendant>;
	findDownAll<Descendant>(Descendant: string | Constructor<Descendant>) {
		if (typeof Descendant === `string`) {
			return [...this.querySelectorAll(Descendant)];
		}
		return [...this.querySelectorAll(
			(Descendant as unknown as typeof Component).selector
		)] as Array<Descendant>;
	}

	findUp<Ancestor>(Ancestor: Constructor<Ancestor>): Ancestor;
	findUp(Ancestor: string): Element | null;
	findUp<Ancestor>(Ancestor: Constructor<Ancestor> | string) {
		const selector = typeof Ancestor === `string`
			? Ancestor
			: (Ancestor as unknown as typeof Component).selector;
		const $match = HTMLElement.prototype.closest.call(this, selector);
		return $match;
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

export class Page extends Component {
	static $pageAttr = `data-page-title`;

	@Component.attribute() pageTitle = ``;

	onPlace() {
		document.title = this.pageTitle;
	}
}

// export function PageFactory<
// 	ObservedAttributeDefinitions extends (
// 		Record<string, ObservedAttributeDefinition<any>> & { // eslint-disable-line @typescript-eslint/no-explicit-any
// 			'data-page-title': {
// 				default: string;
// 			};
// 		}
// 	) = {
// 		'data-page-title': {
// 			default: string;
// 		};
// 	},
// >(
// 	tagName: string,
// 	observedAttributeDefinitions = {} as (
// 		Omit<ObservedAttributeDefinitions, `data-page-title`>
// 	)
// ) {
// 	return class Page extends Component(tagName, {
// 		...observedAttributeDefinitions,
// 		[PageFactory.$pageAttr]: {
// 			default: undefined as unknown as string,
// 		},
// 	}) {};
// }

// class WidgetComponent extends Component.customize(`div`) {
// 	@Component.attribute() name = `steve`;

// 	constructor(age: number, name: string) {
// 		super();
// 	}

// 	@Component.event()
// 	addOne(name: string) {
// 		return 32;
// 	}
// }

// const Widget = Component.init(WidgetComponent);

// const widget = Widget(32, `foo`);
// widget.addOne(`foo`);
// widget.on(`addOne`, foo => ({}));
// widget.bind(`addOne`);
