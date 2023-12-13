import { Emitter } from '@robertakarobin/util/emitter.ts';
import { newUid } from '@robertakarobin/util/uid.ts';
export { html, css } from '@robertakarobin/util/template.ts';
import { appContext, baseUrl } from '@robertakarobin/util/context.ts';

export type BoundElement = HTMLElement & {
	[Component.$elInstance]: Component; // Attaching instances to Elements should prevent the instance from being garbage-collected until the Element is GCd
};

export const globals = (appContext === `browser` ? window : global) as unknown as Window
	& { [key in typeof Component.name]: typeof Component; }
	& { [key in typeof Component.unhydratedArgsName]: Record<Component[`id`], object> };

type HTMLAttributeValue = string | number | undefined | null;

export class Component<State = Record<string, unknown>> extends Emitter<State> {
	static readonly $elAttrId = `data-id`;
	static readonly $elAttrType = `data-component`;
	static readonly $elInstance = `instance`;
	private static currentParent: Component;
	private static instances = new Map<Component[`id`], WeakRef<Component>>();
	private static rootParent: Component;
	static get selector() {
		return `[${this.$elAttrType}='${this.name}']`;
	}
	static readonly style: string | undefined;
	static readonly subclasses = new Map<string, typeof Component>();
	static readonly unhydratedArgsName = `unhydratedArgs`;

	static {
		globals[this.name] = this;
	}

	static createId() {
		return newUid();
	}

	/**
	 * Get an existing component instance by its ID
	 */
	static get(id: Component[`id`]) {
		const existingRef = Component.instances.get(id);
		if (existingRef !== undefined) {
			const existing = existingRef.deref();
			if (existing !== undefined) {
				return existing;
			}
			console.debug(`${id} GCd, rebuilding`);
		}
	}

	/**
	 * Component setup tasks, e.g. applying the component's CSS/styles. Should run after the page is done loading. Recommend adding `static { this.init() }` when defining a component.
	 */
	static init() {
		Component.subclasses.set(this.name, this);
		Object.assign(this, {
			style: this.style?.replace(/::?host/g, this.selector), // style is readonly; just override it here
		});
		this.setStyle();
	}

	/**
	 * Parse the given string to an HTML DOM fragment.
	 */
	static parse(input: string) {
		const parser = new DOMParser();
		return parser.parseFromString(input, `text/html`);
	}

	/**
	 * Applies the component's CSS/styles to the current page
	 */
	static setStyle() {
		if (
			typeof this.style === `string`
			&& document.querySelector(`style${this.selector}`) === null
		) {
			const $style = document.createElement(`style`);
			$style.textContent = this.style;
			$style.setAttribute(Component.$elAttrType, this.name);
			document.head.appendChild($style);
		}
	}

	/**
	 * The root DOM element to which the component is attached
	 */
	$el: BoundElement | undefined;
	/**
	 * Holds the values which will be rendered as HTML attributes on the component's DOM element
	 * @see Component.attrs()
	 */
	attributes = {} as Record<string, HTMLAttributeValue>;
	/**
	 * As the component's template is being rendered, holds the index of the child component currently being rendered. Used to create the child component's ID.
	 */
	private childIndex = 0;
	/**
	 * Holds the string which will be rendered inside the component; i.e. if the component was an HTML element, what would go inside its <tag></tag>
	 */
	content = ``;
	/**
	 * @returns The instance's constructor
	 */
	get Ctor() {
		return this.constructor as typeof Component;
	}
	/**
	 * When a component is instantiated, if an existing component has the same ID, the template for the existing component is used instead of a new template being rendered to the DOM. By default the ID is based on the index of the current component within its parent component.
	 */
	readonly id: string = ``;
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
	 * The component that owns the template inside of which the current component is being rendered
	 */
	parent: Component | undefined;
	/**
	 * Warning: `style` should be defined as a static property, not an instance property
	*/
	private readonly style: void = undefined;

	/**
	 * Creates a component instance
	 * @param id @see Component.id
	 */
	constructor(
		id?: Component[`id`],
		...args: ConstructorParameters<typeof Emitter<State>>
	) {
		super(...args);

		if (!Component.subclasses.has(this.Ctor.name)) {
			this.Ctor.init();
		}

		if (Component.currentParent === undefined) {
			this.id = id ?? Component.createId();
		} else {
			this.parent = Component.currentParent;
			this.id = id ?? `${this.parent.id}_${this.parent.childIndex++}`;
		}

		const existing = Component.get(this.id);
		if (existing !== undefined) {
			return existing as Component<State>;
		}

		Component.instances.set(this.id, new WeakRef(this as Component));
	}

	/**
	 * Sets and/or places the component's HTML attributes
	 */
	attrs(input?: Component[`attributes`]) {
		if (input !== undefined) {
			this.attributes = input;
		}
		this.setAttributes(this.attributes);
		return this;
	}

	/**
	 * Returns a JavaScript string that can be assigned to an HTML event attribute to call the given method with the given arguments
	 * Arguments must be strings or numbers since other data types can't really be written onto the DOM
	 * @example `<button onclick=${this.bind(`onClick`, `4.99`)}>$4.99</button>`
	 */
	protected bind(
		targetName: keyof this, // TODO2: Narrow this to be specifically a method name
		...args: Array<string | number> | []
	) {
		const target = this[targetName] as Function;
		const argsString = args.map(arg => {
			if (typeof arg === `string`) {
				return `'${arg}'`;
			}
			return arg;
		}).join(`,`);
		const out = target instanceof Emitter
			? `.next(${argsString})`
			: `(event,${argsString})`;
		return `"this.closest(\`${this.Ctor.selector}\`).${Component.$elInstance}.${targetName as string}${out}"`;
	}

	/**
	 * Looks for and returns the first instance of the specified constructor, or element of the specified selector, in the current component's ancestor chain
	 */
	closest(Ancestor: string): HTMLElement;
	closest<Ancestor>(Ancestor: new () => Ancestor): Ancestor;
	closest<Ancestor>(Ancestor: (new () => Ancestor) | string) {
		const selector = typeof Ancestor === `string`
			? Ancestor
			: (Ancestor as unknown as typeof Component).selector;

		const $match = this.$el?.closest(selector);
		if ($match) {
			if (typeof Ancestor === `string`) {
				return $match;
			}
			return ($match as BoundElement).instance;
		}
	}

	/**
	 * Looks for and returns the first instance of the specified constructor, or element of the specified selector, within the current component's template
	 */
	find(Descendant: string): HTMLElement; // TODO3: Stronger typing for this
	find<Descendant>(Descendant: new () => Descendant): Descendant;
	find<Descendant>(Descendant: (new () => Descendant) | string) {
		const selector = typeof Descendant === `string`
			? Descendant
			: (Descendant as unknown as typeof Component).selector;

		const $match = this.$el?.querySelector(selector);
		if ($match) {
			if (typeof Descendant === `string`) {
				return $match;
			}
			return ($match as BoundElement).instance;
		}
	}

	/**
	 * Looks for and returns all instances of the specified constructor, or all elements of the specified selector, within the current component's template
	 */
	findAll(Descendant: string): Array<HTMLElement>;
	findAll<Descendant>(Descendant: new () => Descendant): Array<Descendant>;
	findAll<Descendant>(Descendant: (new () => Descendant) | string) {
		const selector = typeof Descendant === `string`
			? Descendant
			: (Descendant as unknown as typeof Component).selector;

		const descendants = [];

		const $descendants = this.$el?.querySelectorAll(selector) as NodeListOf<BoundElement>;
		if ($descendants === undefined) {
			return;
		}
		if (typeof Descendant === `string`) {
			descendants.push(...Array.from($descendants));
		} else {
			for (const $descendant of $descendants) {
				descendants.push($descendant.instance as Descendant);
			}
		}

		return descendants;
	}

	/**
	 * Given some already-rendered HTML, e.g. from a static HTML file rendered through SSG, creates component instances for all elements that expect them, and hydrates them with data found in `<script id="unhydratedArgs">` if it exists
	 */
	hydrate($root: Element = document.body) {
		Component.currentParent = Component.rootParent = Component.rootParent ?? new Component();

		const unhydratedArgs = globals[Component.unhydratedArgsName];

		const $el = $root.getAttribute(Component.$elAttrType) === this.Ctor.name
			? $root
			: $root.querySelector(this.Ctor.selector)!;
		Object.assign(this, {
			id: $el.getAttribute(Component.$elAttrId)!, // The component has already been instantiated at this point, so need to overwrite its ID
		});
		this.setEl($el);

		const $els = $root.querySelectorAll(`[${Component.$elAttrType}]`);
		for (const $el of Array.from($els) as Array<BoundElement>) {
			const id = $el.getAttribute(Component.$elAttrId)!;
			if (id === this.id) {
				continue;
			}
			const constructorName = $el.getAttribute(Component.$elAttrType)!;
			const Constructor = Component.subclasses.get(constructorName)!;
			const args = unhydratedArgs[id];
			delete unhydratedArgs[id];
			const instance = new Constructor(id).set(args);
			instance.setEl($el);
			Component.instances.set(id, new WeakRef(instance));
		}

		document.getElementById(Component.unhydratedArgsName)?.remove();

		this.render();
		$el.replaceWith(this.$el!);
	}

	/**
	 * Called when the component is rendered
	 */
	onRender() {}

	/**
	 * Compiles the component's template, looping through all nested components. If a component's ID matches the ID of an existing component, the existing component's template is swapped in instead of rerendered.
	 * Returns a comment string; this is a placeholder that is swapped out for the component's template.
	 */
	render(content: string = ``) {
		this.content = content;

		const ownParent = Component.currentParent;
		Component.currentParent = this as Component;
		Component.currentParent.childIndex = 0;

		const doc = Component.parse(this.template(content ?? this.content));
		const $el = this instanceof Page
			?	doc.body as unknown as BoundElement
			: doc.body.children[0] as BoundElement;
		this.setEl($el);

		Component.currentParent = ownParent;

		const iterator = doc.createNodeIterator(
			doc.body,
			NodeFilter.SHOW_COMMENT,
			() => NodeFilter.FILTER_ACCEPT,
		);
		let $placeholder: Node | null | undefined;
		while ($placeholder = iterator.nextNode()) {
			const id = $placeholder.textContent;
			if (id === null) {
				continue;
			}
			const instance = Component.get(id)!;

			if ($placeholder.nextSibling) {
				$placeholder.parentNode?.insertBefore(instance.$el!, $placeholder.nextSibling);
			} else {
				$placeholder.parentNode?.appendChild(instance.$el!);
			}
			$placeholder.parentNode?.removeChild($placeholder);
		}

		if (Component.currentParent === Component.rootParent) { // Keep this from running unnecessarily for all descendant components
			const $links = $el.querySelectorAll(`a`);
			for (const $link of $links) {
				const href = $link.getAttribute(`href`)!;
				let url: URL;
				try {
					url = new URL(href, baseUrl);
				} catch {
					continue;
				}
				if (url.origin !== baseUrl.origin) {
					if ($link.getAttribute(`rel`) === null) {
						$link.setAttribute(`rel`, `noopener`);
					}
					if ($link.getAttribute(`target`) === null) {
						$link.setAttribute(`target`, `_blank`);
					}
				}
			}
		}

		this.setAttributes(this.attributes);

		this.onRender();

		return `<!--${this.id}-->`;
	}

	/**
	 * Same as `.render` except it returns the component's element
	 */
	renderedEl() {
		this.render();
		return this.$el!;
	}

	private setAttribute(attributeName: string, value?: HTMLAttributeValue) {
		if (value !== undefined && value !== null && value !== ``) {
			this.$el!.setAttribute(attributeName, value.toString());
		} else {
			this.$el!.removeAttribute(attributeName);
		}
	}

	private setAttributes(input: Record<string, HTMLAttributeValue> = {}) {
		if (this.$el) {
			for (const attributeName in input) {
				this.setAttribute(attributeName, input[attributeName]);
			}
		}
	}

	/**
	 * Sets the component's root element
	 */
	private setEl($input: Element) {
		const $el = $input as BoundElement;
		this.$el = $el;
		this.$el.setAttribute(Component.$elAttrType, this.Ctor.name);
		this.$el.setAttribute(Component.$elAttrId, this.id);
		this.$el[Component.$elInstance] = this as Component;
	}

	/**
	 * Defines what is written into the document when this instance is rendered
	 */
	template(content: string = ``): string {
		return content ?? ``;
	}

	/**
	 * Returns the component's current HTML
	 */
	toHTML() {
		return this.$el?.outerHTML ?? ``;
	}
}

type PageType = {
	title: string;
};

/**
 * A Page is just a Component that (a) updates the current page's `<title>`, and (b) should have a template that starts with a `<body>` tag (unless a different layout is specified in the build process)
 */
export abstract class Page<
	State extends Record<string, unknown> = Record<string, unknown>,
> extends Component<PageType & State> {
	set(...[update, ...args]: Parameters<Component<{ title: string; } & State>[`set`]>) {
		if (`title` in update) {
			if (appContext === `browser`) {
				document.title = update.title!;
			}
		}
		return super.set(update, ...args);
	}
}
