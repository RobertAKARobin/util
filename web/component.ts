import { appContext } from '@robertakarobin/util/context.ts';
import { newUid } from '@robertakarobin/util/uid.ts';

export { html, css } from '@robertakarobin/util/template.ts';

type Constructor<Classtype> = new (...args: any) => Classtype; // eslint-disable-line @typescript-eslint/no-explicit-any

type AttributeValue = string | number | symbol | undefined | null;

const unconnectedElements = new Map<HTMLElement[`id`], WeakRef<HTMLElement>>();

const globalProperty = `El`;
const globalVars = globalThis as typeof globalThis & {
	[globalProperty]: Record<string, unknown>;
};
globalVars[globalProperty] = {};

export function ComponentFactory<
	ObservedAttributes extends Record<string, AttributeValue> = Record<string, never>,
>(
	tagName: string,
	observedAttributesDefaults: ObservedAttributes = {} as ObservedAttributes
) {
	const BaseElement = document.createElement(tagName).constructor as Constructor<HTMLElement>;
	for (const key in observedAttributesDefaults) {
		if (/A-Z/.test(key)) {
			throw new Error(`observedAttributes must be dash-cased`);
		}
	}

	return class Component extends BaseElement {
		static readonly elName: string;
		static readonly observedAttributes = Object.keys(observedAttributesDefaults);
		static readonly selector: string;
		static readonly style: string | undefined;

		/**
		 * Returns the existing component with the given ID, or of this constructor. If no match is found for the given ID, builds a new component with that ID.
		 */
		static get<Subclass extends Constructor<Component>>(this: Subclass, id?: Component[`id`]) {
			let existing = id === undefined
				? document.querySelector((this as unknown as typeof Component).selector)
				: document.getElementById(id);
			if (existing === null) {
				existing = new this(id);
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

			Object.assign(this, { elName, selector, style });

			this.placeStyle(); // Has to come after elName has been assigned

			globalVars[globalProperty][this.name] = this;

			globalThis.customElements.define(elName, this, { extends: tagName }); // This should come last because when a custom element is defined its constructor runs for all instances on the page

			ComponentFactory.subclasses.add(this);
		}

		/**
		 * Applies the component's CSS/styles to the current page
		 */
		static placeStyle() {
			if (
				typeof this.style === `string`
				&& document.querySelector(`style[${ComponentFactory.$styleAttr}='${this.elName}']`) === null
			) {
				const $style = document.createElement(`style`);
				$style.textContent = this.style;
				$style.setAttribute(ComponentFactory.$styleAttr, this.elName);
				document.head.appendChild($style);
			}
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
		constructor(initialAttributes: Partial<ObservedAttributes> = {}) {
			super();

			this.setAttributes({
				...observedAttributesDefaults,
				...initialAttributes,
			});
			this.id = (initialAttributes[`id`] ?? this.getAttribute(`id`) ?? ComponentFactory.createId()) as string; // If an element has no ID, this.id is empty string, and this.getAttribute(`id`) is null
			this.setAttribute(ComponentFactory.$elAttr, this.Ctor.elName);
			this.onEl();
		}

		protected attributeChangedCallback(
			attributeName: string,
			oldValue: string,
			newValue: string,
		) {
			this.onChange(attributeName, oldValue, newValue);
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

		get(attributeName: string) {
			return this.getAttribute(attributeName) as string;
		}

		onChange(
			_attributeName: string,
			_oldValue: string,
			_newValue: string,
		) {}

		/**
		 * Called when the instance's element is defined
		 */
		onEl() {}

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
		set(observedAttributes: Partial<ObservedAttributes>) {
			return this.setAttributes(observedAttributes);
		}

		/**
		 * Sets the component's HTML attributes
		 */
		setAttributes(attributes: Record<string, AttributeValue>) {
			for (const attributeName in attributes) {
				const value = attributes[attributeName];
				if (value === undefined || value === null) {
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

export function PageFactory<ObservedAttributes>(
	tagName: string,
	observedAttributes: ObservedAttributes = {} as ObservedAttributes,
) {
	return class Page extends ComponentFactory(tagName, {
		[PageFactory.$pageAttr]: undefined as unknown as string,
		...observedAttributes,
	}) {};
}
PageFactory.$pageAttr = `data-page-title`;

export type PageConstructor = ReturnType<typeof PageFactory>;
export type PageInstance = InstanceType<PageConstructor>;
