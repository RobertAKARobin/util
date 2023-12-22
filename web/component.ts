import { appContext } from '@robertakarobin/util/context.ts';
import { newUid } from '@robertakarobin/util/uid.ts';

export { html, css } from '@robertakarobin/util/template.ts';

type Constructor<Classtype> = new (...args: any) => Classtype; // eslint-disable-line @typescript-eslint/no-explicit-any

type AttributeValue = string | number | symbol | undefined | null;

const unconnectedElements = new Map<HTMLElement[`id`], WeakRef<HTMLElement>>();

export function Component<
	Dataset extends Record<string, AttributeValue> = Record<string, never>,
>(
	tagName: string,
	dataDefaults: Dataset = {} as Dataset
) {
	const BaseElement = document.createElement(tagName).constructor as Constructor<HTMLElement>;
	return class Component extends BaseElement {
		static readonly $elAttr = `is`;
		static readonly $styleAttr = `data-style`;
		static readonly elName: string;
		static readonly observedAttributes = Object.keys(dataDefaults);
		static readonly selector: string;
		static readonly style: string | undefined;

		static createId() {
			return `l${newUid()}`;
		}

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

			const selector = `[${this.$elAttr}='${elName}']`;
			const style = this.style?.replace(/::?host/g, selector);
			this.placeStyle();

			globalThis.customElements.define(elName, this, { extends: tagName });
			Object.assign(this, { elName, selector, style });
		}

		/**
		 * Applies the component's CSS/styles to the current page
		 */
		static placeStyle() {
			if (
				typeof this.style === `string`
				&& document.querySelector(`style[${this.$styleAttr}='${this.elName}']`) === null
			) {
				const $style = document.createElement(`style`);
				$style.textContent = this.style;
				$style.setAttribute(Component.$styleAttr, this.elName);
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
		get data() {
			return this.dataset as Dataset;
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
		constructor(id?: string | null, ..._args: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
			super();
			this.setAttribute(`id`, id ?? Component.createId());
			this.set(dataDefaults);
			this.onEl();
		}

		protected attributeChangedCallback<
			AttributeName extends keyof this,
			Value extends this[AttributeName],
		>(
			attributeName: AttributeName,
			oldValue: Value,
			newValue: Value,
		) {
			this.onChange(attributeName, oldValue, newValue);
		}

		/**
		 * Sets and/or places the component's HTML attributes
		 */
		attrs(attributes: Record<string, AttributeValue>) {
			for (const attributeName in attributes) {
				const value = attributes[attributeName];
				if (value === undefined || value === null) {
					this.removeAttribute(attributeName);
				} else {
					this.setAttribute(
						attributeName,
						attributes[attributeName]!.toString(),
					);
				}
			}
			return this;
		}

		closest<Ancestor>(Ancestor: Constructor<Ancestor>): Ancestor;
		closest(Ancestor: string): Element | null;
		closest<Ancestor>(Ancestor: Constructor<Ancestor> | string) {
			const selector = (Ancestor as unknown as typeof Component).selector;
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

		onChange<
			AttributeName extends keyof this,
			Value extends this[AttributeName],
		>(
			_attributeName: AttributeName,
			_oldValue: Value,
			_newValue: Value,
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

		set(input: Partial<typeof dataDefaults>) {
			for (const key in input) {
				this.dataset[key] = input[key] as string;
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

export type ComponentConstructor = ReturnType<typeof Component>;
export type ComponentInstance = InstanceType<ComponentConstructor>;

export function Page<Dataset>(
	tagName: string,
	dataDefaults: Dataset = {} as Dataset,
) {
	return class extends Component(tagName, {
		title: ``,
		...dataDefaults,
	}) {
		onEl() {
			document.title = this.data.title;
		}
	};
}


export type PageConstructor = ReturnType<typeof Page>;
export type PageInstance = InstanceType<PageConstructor>;
