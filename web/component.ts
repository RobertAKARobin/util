import { appContext } from '@robertakarobin/util/context.ts';
import { newUid } from '@robertakarobin/util/uid.ts';

export { html, css } from '@robertakarobin/util/template.ts';

type Constructor<Classtype> = new (...args: any) => Classtype; // eslint-disable-line @typescript-eslint/no-explicit-any

export type HTMLAttributeValue = string | number | symbol | undefined | null;

const unconnectedElements = new Map<HTMLElement[`id`], WeakRef<HTMLElement>>();

const globalProperty = `El`;
const globalVars = globalThis as typeof globalThis & {
	[globalProperty]: Record<string, unknown>;
};
globalVars[globalProperty] = {};

export type ObservedAttributeDefinition<Value = unknown> = {
	default: Value;
	fromString?: (input: string) => Value;
};

export function ComponentFactory<
	ObservedAttributeDefinitions extends Record<string, ObservedAttributeDefinition>,
	ObservedAttributeValues extends {
		[AttributeName in keyof ObservedAttributeDefinitions]: ObservedAttributeDefinitions[AttributeName][`default`]
	},
>(
	tagName: string,
	observedAttributeDefinitions = {} as ObservedAttributeDefinitions,
) {
	const BaseElement = document.createElement(tagName).constructor as Constructor<HTMLElement>;
	for (const attributeName in observedAttributeDefinitions) {
		const attributeDefinition = observedAttributeDefinitions[attributeName];
		const defaultValue = attributeDefinition.default;
		attributeDefinition.fromString = attributeDefinition.fromString ?? (
			typeof defaultValue === `number` ? Number
				: typeof defaultValue === `boolean` ? Boolean
					: (input: string) => (
						input === null ? null
							: input === undefined ? undefined
								: input === `` ? undefined
									: input
					)
		);
	}

	return class Component extends BaseElement {
		static readonly elName: string;
		static readonly observedAttributes = Object.keys(observedAttributeDefinitions);
		static readonly observedAttributesDefaults = Object.entries(observedAttributeDefinitions)
			.reduce((attributes, [attributeName, attribute]) => {
				const key = attributeName as keyof ObservedAttributeValues;
				attributes[key] = attribute.default as ObservedAttributeValues[typeof key];
				return attributes;
			}, {} as ObservedAttributeValues);
		static readonly selector: string;
		static readonly style: string | undefined;

		/**
		 * Returns the existing component with the given ID, or of this constructor. If no match is found for the given ID, builds a new component with that ID.
		 */
		static get<Subclass extends Constructor<Component>>(
			this: Subclass,
			id?: Component[`id`]
		) {
			let existing = id === undefined
				? document.querySelector((this as unknown as typeof Component).selector)
				: document.getElementById(id);
			if (existing === null) {
				existing = new this({ id });
			} else {
				if (!(existing instanceof this)) {
					throw new Error();
				}
			}
			return existing as InstanceType<Subclass>;
		}

		/**
		 * Returns all components matching the given constructor.
		 */
		static getAll<Subclass extends typeof Component>(this: Subclass) {
			return [...document.querySelectorAll(this.selector)].map($el => {
				return $el as InstanceType<Subclass>;
			});
		}

		/**
		 * Component setup tasks, e.g. applying the component's CSS/styles. Should run after the page is done loading. Recommend adding `static { this.init() }` when defining a component.
		 */
		static init() {
			const elName = `l-${this.name.toLowerCase()}`;

			if (customElements.get(elName)) {
				return;
			}

			const selector = `[${ComponentFactory.$elAttr}='${elName}']`;
			const style = this.style?.replace(/::?host/g, selector);
			if ( // Has to come after elName has been assigned
				typeof style === `string`
				&& document.querySelector(`style[${ComponentFactory.$styleAttr}='${elName}']`) === null
			) {
				const $style = document.createElement(`style`);
				$style.textContent = style;
				$style.setAttribute(ComponentFactory.$styleAttr, elName);
				document.head.appendChild($style);
			}

			Object.assign(this, { elName, selector, style });

			globalVars[globalProperty][this.name] = this;

			globalThis.customElements.define(elName, this, { extends: tagName }); // This should come last because when a custom element is defined its constructor runs for all instances on the page

			ComponentFactory.subclasses.add(this as ComponentConstructor);
		}

		/**
		 * Content that will be rendered inside this element.
		 */
		contents = `` as string | undefined | null;
		/**
		 * @returns The instance's constructor
		 */
		get Ctor() {
			return this.constructor as typeof Component;
		}
		readonly events = {} as Record<string, (...args: Array<any>) => any>; // eslint-disable-line @typescript-eslint/no-explicit-any
		/**
		 * Whether this component's data should be included in the data used to hydrate pages rendered via SSG.
		 * @see `Component.hydrate`
		 */
		readonly isHydrated: boolean = true; // TODO2: Test
		/**
		 * If true, if this is a Page it will be compiled into a static `.html` file at the route(s) used for this Page, which serves as a landing page for performance and SEO purposes.
		 * If this is a Component it will be compiled into static HTML included in the landing page.
		 * Not a static variable because a Component/Page may/may not want to be SSG based on certain conditions
		*/
		readonly isSSG: boolean = true;

		/**
		 * Creates a component instance
		 * @param id @see Component.id
		 */
		constructor(
			initial = {} as Partial<ObservedAttributeValues>,
		) {
			super();

			const initialValues = {} as ObservedAttributeValues;
			for (const attributeName in observedAttributeDefinitions) {
				initialValues[attributeName] = (
					initial[attributeName]
						?? this.getAttribute(attributeName)
						?? this.Ctor.observedAttributesDefaults[attributeName]
				) as ObservedAttributeValues[typeof attributeName];
			}
			this.set(initialValues);
			this.id = (initialValues[`id`] ?? this.getAttribute(`id`) ?? ComponentFactory.createId()) as string; // If an element has no ID, this.id is empty string, and this.getAttribute(`id`) is null
			this.setAttribute(ComponentFactory.$elAttr, this.Ctor.elName);
			this.onConstruct();
		}

		protected attributeChangedCallback(
			attributeName: string,
			oldValue: string,
			newValue: string,
		) {
			this.onChange(attributeName, oldValue, newValue);
		}

		bind(methodKey: keyof this) {
			const methodName = methodKey as string;
			return `this.closest(\`${this.Ctor.selector}\`).${methodName}(event)`;
		}

		closest<Ancestor>(Ancestor: Constructor<Ancestor>): Ancestor;
		closest(Ancestor: string): Element | null;
		closest<Ancestor>(Ancestor: Constructor<Ancestor> | string) {
			const selector = typeof Ancestor === `string`
				? Ancestor
				: (Ancestor as unknown as typeof Component).selector;
			const $match = super.closest(selector);
			return $match;
		}

		protected connectedCallback() {
			this.onPlace();
		}

		/**
		 * Set the inner content of the element.
		 */
		content(content: string | undefined | null) {
			this.contents = content;
			return this;
		}

		protected disconnectedCallback() {
			this.onRemove();
		}

		emit<
			EventKey extends keyof this[`events`],
			EventDetail extends this[`events`][EventKey],
		>(eventKey: EventKey, arg?: Parameters<EventDetail>[0]) {
			const eventName = eventKey as string;
			const detail = this.events[eventName](arg) as unknown;
			const event = new CustomEvent(eventName, {
				bubbles: true,
				detail,
			});
			this.dispatchEvent(event);
		}

		/**
		 * Looks for and returns the first instance of the specified constructor, or element of the specified selector, within the current component's template
		 */
		find<Descendant>(Descendant: Constructor<Descendant>) {
			const selector = (Descendant as unknown as typeof Component).selector;
			const $match = this.querySelector(selector);
			return $match as Descendant;
		}

		/**
		 * Looks for and returns all instances of the specified constructor, or all elements of the specified selector, within the current component's template
		 */
		findAll<Descendant>(Descendant: Constructor<Descendant>) {
			const selector = (Descendant as unknown as typeof Component).selector;

			const $descendants = this.querySelectorAll(selector);
			return $descendants;
		}

		get<
			AttributeName extends keyof ObservedAttributeDefinitions,
			AttributeValue extends ObservedAttributeDefinitions[AttributeName][`default`],
		>(attributeName: AttributeName): AttributeValue {
			const attributeValue = this.getAttribute(attributeName as string)!;
			const attributeDefinition = observedAttributeDefinitions[attributeName];
			return attributeDefinition.fromString!(attributeValue) as AttributeValue;
		}

		on<
			EventName extends keyof this[`events`],
			EventDetail extends ReturnType<this[`events`][EventName]>,
		>(
			eventKey: EventName,
			doWhat: (event: CustomEvent<EventDetail>) => void
		) {
			const eventName = eventKey.toString();
			this.addEventListener(eventName, doWhat as EventListener);
			return this;
		}

		onChange(
			_attributeName: string,
			_oldValue: string,
			_newValue: string,
		) {}

		/**
		 * Called when the instance's element is defined
		 */
		onConstruct() {}

		/**
		 * Called when the instance's element is attached to or moved within a document
		 */
		onPlace() {}

		/**
		 * Called when the instance's element is removed from a document
		 */
		onRemove() {}

		render() {
			this.innerHTML = this.template();

			const newCommentIterator = () => document.createNodeIterator(
				this,
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
				const $el = unconnectedElements.get(id)!.deref()!;
				$placeholder.replaceWith($el);

				if (appContext !== `browser`) {
					iterator = newCommentIterator();
				}
			}

			return this;
		}

		/**
		 * Sets the component's observed attributes
		 */
		set(observedAttributes: Partial<ObservedAttributeValues>) {
			return this.setAttributes(observedAttributes as Record<string, HTMLAttributeValue>);
		}

		/**
		 * Sets the component's HTML attributes
		 */
		setAttributes(attributes: Record<string, HTMLAttributeValue>) {
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
			return subclassTemplate ?? this.contents ?? ``;
		}

		toString() {
			this.innerHTML = this.template();
			unconnectedElements.set(this.id, new WeakRef(this));
			return `<!--${this.id}-->`;
		}
	};
}
ComponentFactory.createId = () => `l${newUid()}`;
ComponentFactory.subclasses = new Set<ComponentConstructor>();
ComponentFactory.$elAttr = `is`;
ComponentFactory.$styleAttr = `data-style`;

export type ComponentConstructor = ReturnType<typeof ComponentFactory>;
export type ComponentInstance = InstanceType<ComponentConstructor>;

export function PageFactory<
	ObservedAttributeDefinitions extends (
		Record<string, ObservedAttributeDefinition<any>> & { // eslint-disable-line @typescript-eslint/no-explicit-any
			'data-page-title': {
				default: string;
			};
		}
	) = {
		'data-page-title': {
			default: string;
		};
	},
>(
	tagName: string,
	observedAttributeDefinitions = {} as (
		Omit<ObservedAttributeDefinitions, `data-page-title`>
	)
) {
	return class Page extends ComponentFactory(tagName, {
		...observedAttributeDefinitions,
		[PageFactory.$pageAttr]: {
			default: undefined as unknown as string,
		},
	}) {};
}
PageFactory.$pageAttr = `data-page-title`;

export type PageConstructor = ReturnType<typeof PageFactory>;
export type PageInstance = InstanceType<PageConstructor>;
