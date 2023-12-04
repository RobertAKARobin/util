import { appContext } from '@robertakarobin/jsutil/context.ts';
import { Emitter } from '@robertakarobin/jsutil/emitter.ts';
import { newUid } from '@robertakarobin/jsutil/index.ts';

export type BoundElement = Element & {
	[Component.$elInstance]: Component; // Attaching instances to Elements should prevent the instance from being garbage-collected until the Element is GCd
};

export const globals = (appContext === `browser` ? window : global) as unknown as Window
	& { [key in typeof Component.name]: typeof Component; }
	& { [key in typeof Component.unhydratedDataName]: Record<Component[`id`], object> };

export class Component<State = any> extends Emitter<State> { // eslint-disable-line @typescript-eslint/no-explicit-any
	static readonly $elAttrId = `data-id`;
	static readonly $elAttrType = `data-component`; // TODO1: Consolidate; use CSS [attr*=_type@]
	static readonly $elInstance = `instance`;
	static currentParent: Component;
	static instances = new Map<Component[`id`], Component>();
	static NodeFilter: typeof NodeFilter;
	static rootParent: Component;
	static readonly style: string | undefined;
	static readonly subclasses = new Map<string, typeof Component>();
	static readonly unhydrated$Els = new Map<Component[`id`], Element>();
	static readonly unhydratedDataName = `unhydratedArgs`;

	static {
		globals[this.name] = this;

		if (appContext === `browser`) {
			Component.NodeFilter = window.NodeFilter;
		}
	}

	static commentIterator(doc: Document) {
		return doc.createNodeIterator(
			doc.body,
			Component.NodeFilter.SHOW_COMMENT,
			() => Component.NodeFilter.FILTER_ACCEPT
		);
	}

	static createId() {
		return newUid();
	}

	/**
	 * Should run after the page is done loading
	 */
	static init() {
		Component.subclasses.set(this.name, this);
		this.setStyle();
	}

	static parse(input: string) {
		const parser = new DOMParser();
		return parser.parseFromString(input, `text/html`);
	}

	static setStyle() {
		if (appContext !== `browser`) {
			return;
		}

		if (
			typeof this.style === `string`
			&& document.querySelector(`style[${this.$elAttrType}="${this.name}"]`) === null
		) {
			const $style = document.createElement(`style`);
			$style.textContent = this.style;
			$style.setAttribute(Component.$elAttrType, this.name);
			document.head.appendChild($style);
		}
	}

	/**
	 * The element to which this instance is bound
	 */
	$el: BoundElement | undefined;
	childIndex = 0;
	content = ``;
	/**
	 * @returns The instance's constructor
	 */
	get Ctor() {
		return this.constructor as typeof Component;
	}
	get CtorName() {
		return this.Ctor.name;
	}
	id: string = ``;
	/**
	 * If true, if this is a Page it will be compiled into a static `.html` file at the route(s) used for this Page, which serves as a landing page for performance and SEO purposes.
	 * If this is a Component it will be compiled into static HTML included in the landing page.
	 * Not a static variable because a Component/Page may/may not want to be SSG based on certain conditions
	*/
	readonly isSSG: boolean = true;
	parent: Component | undefined;
	/**
	 * Warning: `style` should be defined as a static property, not an instance property
	*/
	private readonly style: void = undefined;

	constructor(args?: { id?: string; } & State) {
		super({ initial: args });

		if (!Component.subclasses.has(this.Ctor.name)) {
			this.Ctor.init();
		}

		if (Component.currentParent === undefined) {
			this.id = args?.id ?? Component.createId();
		} else {
			this.parent = Component.currentParent;
			this.id = args?.id ?? `${this.parent.id}_${this.parent.childIndex++}`;
			const existing = Component.instances.get(this.id);
			if (existing) {
				existing.next(args);
				return existing;
			}

			Component.instances.set(this.id, this);
		}

		if (appContext === `build` && args) {
			globals[Component.unhydratedDataName][this.id] = args;
		}
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
		return `"this.closest('[${Component.$elAttrType}=${this.Ctor.name}]').${Component.$elInstance}.${targetName as string}${out}"`;
	}

	closest(Ancestor: string): Element;
	closest<Ancestor extends typeof Component>(Ancestor: Ancestor): Ancestor;
	closest<Ancestor extends typeof Component>(Ancestor: Ancestor | string) {
		const selector = typeof Ancestor === `string`
			? Ancestor
			: `[${Component.$elAttrType}=${Ancestor.name}]`;

		const $match = this.$el?.closest(selector);
		if ($match) {
			if (typeof Ancestor === `string`) {
				return $match;
			}
			return ($match as BoundElement).instance;
		}
	}

	find(Descendant: string): Element;
	find<Descendant extends typeof Component>(Descendant: Descendant): Descendant;
	find<Descendant extends typeof Component>(Descendant: Descendant | string) {
		const selector = typeof Descendant === `string`
			? Descendant
			: `[${Component.$elAttrType}=${Descendant.name}]`;

		const $match = this.$el?.querySelector(selector);
		if ($match) {
			if (typeof Descendant === `string`) {
				return $match;
			}
			return ($match as BoundElement).instance;
		}
	}

	findAll(Descendant: string): Array<BoundElement>;
	findAll<Descendant extends typeof Component>(
		Descendant: Descendant
	): Array<InstanceType<Descendant>>;
	findAll<Descendant extends typeof Component>(Descendant: Descendant | string) {
		const selector = typeof Descendant === `string`
			? Descendant
			: `[${Component.$elAttrType}=${Descendant.name}]`;

		const descendants = [];

		const $descendants = this.$el?.querySelectorAll(selector);
		if ($descendants === undefined) {
			return;
		}
		if (typeof Descendant === `string`) {
			descendants.push(...Array.from($descendants));
		} else {
			for (const $descendant of $descendants as NodeListOf<BoundElement>) {
				descendants.push($descendant.instance as InstanceType<Descendant>);
			}
		}

		return descendants;
	}

	hydrate($root: Element) {
		Component.currentParent = Component.rootParent = Component.rootParent ?? new Component();

		const unhydratedArgs = globals[Component.unhydratedDataName];

		const $el = $root.querySelector(`[${Component.$elAttrType}="${this.Ctor.name}"]`)!;
		this.id = $el.getAttribute(Component.$elAttrId)!; // This has already been instantiated at this point, so need to overwrite its ID
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
			const instance = new Constructor({ ...args, id });
			instance.setEl($el);
			Component.instances.set(id, instance);
		}

		document.getElementById(Component.unhydratedDataName)?.remove();

		this.rerender();
		$el.replaceWith(this.$el!);
	}

	on<Key extends keyof State>(
		key: Key,
		doWhat: (value: State[Key], self: this) => void
	) {
		this.subscribe(value => doWhat(value[key], this));
		return this;
	}

	render(content: string = ``) {
		this.content = content;

		const ownParent = Component.currentParent;
		Component.currentParent = this;
		Component.currentParent.childIndex = 0;

		const doc = Component.parse(this.template(content ?? this.content));
		this.setEl(doc.body.children[0] as BoundElement);

		Component.currentParent = ownParent;

		const iterator = Component.commentIterator(doc);
		let $placeholder: Node | null | undefined;
		while ($placeholder = iterator.nextNode()) {
			const id = $placeholder.textContent;
			if (id === null) {
				continue;
			}
			const instance = Component.instances.get(id)!;

			if ($placeholder.nextSibling) {
				$placeholder.parentNode?.insertBefore(instance.$el!, $placeholder.nextSibling);
			} else {
				$placeholder.parentNode?.appendChild(instance.$el!);
			}
			$placeholder.parentNode?.removeChild($placeholder);
		}

		return `<!--${this.id}-->`;
	}

	rerender() {
		this.render();
		return this.$el!;
	}

	setEl($input: Element) {
		const $el = $input as BoundElement;
		this.$el = $el;
		this.$el.setAttribute(Component.$elAttrType, this.CtorName);
		this.$el.setAttribute(Component.$elAttrId, this.id);
		this.$el[Component.$elInstance] = this;
	}

	/**
	 * Defines what is written into the document when this instance is rendered
	 */
	template(content: string = ``): string {
		return content ?? ``;
	}
}
