import { appContext } from '@robertakarobin/util/context.ts';
import { Emitter } from '@robertakarobin/util/emitter.ts';
import { newUid } from '@robertakarobin/util/uid.ts';

export { html, css } from '@robertakarobin/util/template.ts';

export type BoundElement = HTMLElement & {
	[Component.$elProp]: Component; // Attaching instances to Elements should prevent the instance from being garbage-collected until the Element is GCd
};

type Constructor<Classtype> = new (...args: any) => Classtype; // eslint-disable-line @typescript-eslint/no-explicit-any

export const globals = (appContext === `browser` ? window : global) as unknown as Window
	& { [key in typeof Component.name]: typeof Component; }
	& { [key in typeof Component.unhydratedArgsName]: Record<Component[`id`], object> };

type AttributeValue = string | number | undefined | null;

export class Component<State = Record<string, unknown>> extends Emitter<State> {
	static readonly $elAttr = `is`;
	static readonly $elProp = `instance`;
	static readonly $styleAttr = `data-style`;
	static readonly elName: string;
	static readonly selector: string;
	static readonly style: string | undefined;
	static readonly subclasses = new Map<string, typeof Component>();
	protected static readonly unconnectedElements = new Map<
		Component[`id`],
		WeakRef<BoundElement>
	>();
	static readonly unhydratedArgsName = `unhydratedArgs`;

	static {
		globals[this.name] = this;
		if (appContext === `browser`) {
			this.placeObserver();
		}
	}

	static createId() {
		return `l${newUid()}`;
	}

	/**
	 * Outputs a new component. If an ID is given, outputs the matching existing component, or builds a new one with that ID.
	 */
	static get<Subclass extends typeof Component<any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
		this: Subclass,
		id?: Component[`id`] | null, // TODO2: Add argument for state, but getting the type right is annoying
	) {
		if (typeof id === `string`) {
			const $existing = document.getElementById(id) as BoundElement;
			if ($existing !== null) {
				return $existing.instance as InstanceType<Subclass>;
			}
		}

		return new this(id) as InstanceType<Subclass>;
	}

	static getAll<Subclass extends typeof Component<any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
		this: Subclass,
	) {
		return [...document.querySelectorAll(this.selector)].map($el => {
			return ($el as BoundElement).instance as InstanceType<Subclass>;
		});
	}

	/*
	 * Given some already-rendered HTML, e.g. from a static HTML file rendered through SSG, creates component instances for all elements that expect them, and hydrates them with data found in `<script id="unhydratedArgs">` if it exists
	 */
	static hydrate<Subclass extends typeof Component<any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
		this: Subclass,
		$input?: Element,
	) {
		const unhydratedArgs = globals[Component.unhydratedArgsName];

		const $el = $input === undefined
			? document.querySelector(this.selector) as BoundElement
			: $input as BoundElement;
		const id = $el.id;

		const args = unhydratedArgs?.[id];
		if (args !== undefined) {
			delete unhydratedArgs[id];
		}

		let instance = $el.instance as InstanceType<Subclass>;
		if (instance === undefined) {
			const elName = $el.getAttribute(Component.$elAttr)!;
			const Constructor = Component.subclasses.get(elName)! as Subclass;
			instance = new Constructor(id, args) as InstanceType<Subclass>;
			instance.setEl($el);
		} else {
			if (args !== undefined) {
				instance.patch(args);
			}
		}
		instance.actions.placed();
		return instance;
	}

	/**
	 * @see {@link Component.hydrate}
	 */
	static hydrateAll($input: Element) {
		const $els = $input.querySelectorAll(`[${Component.$elAttr}]`);
		for (const $el of $els) {
			this.hydrate($el);
		}
	}

	/**
	 * Component setup tasks, e.g. applying the component's CSS/styles. Should run after the page is done loading. Recommend adding `static { this.init() }` when defining a component.
	 */
	static init() {
		const elName = `l-${this.name.toLowerCase()}`;
		if (Component.subclasses.has(elName)) {
			return;
		}

		const selector = `[${this.$elAttr}='${elName}']`;
		const style = this.style?.replace(/::?host/g, selector);
		Component.subclasses.set(elName, this);
		Object.assign(this, { elName, selector, style });
		this.placeStyle();
	}

	static parse(input: string) {
		const parser = new DOMParser();
		return parser.parseFromString(input, `text/html`);
	}

	static placeObserver() {
		const observer = new MutationObserver(mutations => {
			for (const mutation of mutations) {
				for (const $node of mutation.addedNodes) {
					if (!($node instanceof HTMLElement)) {
						continue;
					}
					const $el = $node as BoundElement;
					for (const $child of $el.querySelectorAll(`[${Component.$elAttr}]`)) {
						($child as BoundElement).instance.actions.placed();
					}
				}
				for (const $node of mutation.removedNodes) {
					if (!($node instanceof HTMLElement)) {
						continue;
					}
					const $el = $node as BoundElement;
					for (const $child of $el.querySelectorAll(`[${Component.$elAttr}]`)) {
						($child as BoundElement).instance.actions.placed();
					}
				}
			}
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
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
	 * The root DOM element to which the component is attached
	 */
	$el!: BoundElement;
	/**
	 * @see Emitter.actions
	 */
	actions = this.toActions({
		el: () => {
			this.onEl();
			return this.value;
		},
		placed: () => {
			this.onPlace();
			return this.value;
		},
		removed: () => {
			this.onRemove();
			return this.value;
		},
	});
	private attributesCache: Record<string, AttributeValue> = {};
	/**
	 * Content that will be rendered inside this element.
	 */
	contents = ``;
	/**
	 * @returns The instance's constructor
	 */
	get Ctor() {
		return this.constructor as typeof Component;
	}
	/**
	 * When a component is instantiated, if an existing component has the same ID, the template for the existing component is used instead of a new template being rendered to the DOM. By default the ID is based on the index of the current component within its parent component.
	 */
	readonly id: string;
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
	 * Warning: `style` should be defined as a static property, not an instance property
	*/
	private readonly style: void = undefined;

	/**
	 * Creates a component instance
	 * @param id @see Component.id
	 */
	constructor(id?: Component[`id`] | null, ...args: ConstructorParameters<typeof Emitter<State>>) {
		super(...args);

		if (!Component.subclasses.has(this.Ctor.elName)) {
			this.Ctor.init();
		}

		this.id = id ?? Component.createId();
	}

	/**
	 * Sets and/or places the component's HTML attributes
	 */
	attrs(attributes: Record<string, AttributeValue>) {
		if (this.$el === undefined) {
			this.attributesCache = {
				...this.attributesCache,
				...attributes,
			};
		} else {
			for (const attributeName in attributes) {
				const value = attributes[attributeName];
				if (value === undefined || value === null) {
					this.$el.removeAttribute(attributeName);
				} else {
					this.$el.setAttribute(
						attributeName,
						attributes[attributeName]!.toString(),
					);
				}
			}
		}
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
		return `"this.closest(\`${this.Ctor.selector}\`).${Component.$elProp}.${targetName as string}${out}"`;
	}

	/**
	 * Looks for and returns the first instance of the specified constructor in the current component's ancestor chain
	 */
	closest<Ancestor>(Ancestor: Constructor<Ancestor>) {
		const selector = (Ancestor as unknown as typeof Component).selector;

		const $match = this.$el?.closest(selector);
		return ($match as BoundElement)?.instance as Ancestor;
	}

	/**
	 * Set the inner content of the element.
	 */
	content(content: string) {
		this.contents = content;
		return this;
	}

	/**
	 * Looks for and returns the first instance of the specified constructor, or element of the specified selector, within the current component's template
	 */
	find<Descendant>(Descendant: Constructor<Descendant>) {
		const selector = (Descendant as unknown as typeof Component).selector;

		const $match = this.$el?.querySelector(selector);
		return ($match as BoundElement)?.instance as Descendant;
	}

	/**
	 * Looks for and returns all instances of the specified constructor, or all elements of the specified selector, within the current component's template
	 */
	findAll<Descendant>(Descendant: Constructor<Descendant>) {
		const selector = (Descendant as unknown as typeof Component).selector;

		const descendants: Array<Descendant> = [];

		const $descendants = this.$el.querySelectorAll(selector);
		if ($descendants === undefined) {
			return;
		}

		for (const $descendant of $descendants) {
			descendants.push(($descendant as BoundElement).instance as Descendant);
		}

		return descendants;
	}

	hydrate($root: Element = document.documentElement) {
		const $el = $root.querySelector(this.Ctor.selector)!;
		const id = $el.id;
		Object.assign(this, { id });
		this.setEl($el);
	}

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

	/**
	 * Replaces all sub-components with fully-rendered templates
	 */
	render() {
		const $template = document.createElement(`template`);
		$template.innerHTML = this.toString();

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
			$placeholder.replaceWith($el);
			Component.unconnectedElements.delete(id);

			if (appContext !== `browser`) {
				iterator = newCommentIterator(); // JSDOM has a bug that causes it to not pick up new nodes after the DOM tree has been modified; workaround is to just refresh the iterator each time it's modified: https://github.com/jsdom/jsdom/issues/3040
			}
		}
		return this.$el;
	}

	protected setEl($input: Element) {
		const $el = $input as BoundElement;
		this.$el = $el;
		this.$el.id = this.id;
		this.$el.setAttribute(Component.$elAttr, this.Ctor.elName);
		this.$el[Component.$elProp] = this as Component;
		this.attrs(this.attributesCache);
		this.actions.el();
	}

	/**
	 * Defines what is written into the document when this instance is rendered
	 */
	template(body = ``) {
		return body;
	}

	/**
	 * Behind the scenes, compiles the instance's template to DOM nodes and saves them to temporary memory. Returns a comment containing the instance's ID, which can be replaced with the temporary node.
	 */
	toString() {
		const $template = document.createElement(`template`);
		$template.innerHTML = this.template();
		const $el = $template.content.firstElementChild as BoundElement;
		this.setEl($el);
		Component.unconnectedElements.set(this.id, new WeakRef($el));
		return `<!--${this.id}-->`;
	}
}

type PageType = {
	title: string;
};

/**
 * A Page is just a Component that updates the current page's `<title>`
 */
export class Page<
	State extends Record<string, unknown> = Record<string, unknown>,
> extends Component<PageType & State> {

	hydrate() {
		super.hydrate();
		Component.hydrateAll(this.$el);
	}

	onEl() {
		document.title = this.value.title!;
	}
}
