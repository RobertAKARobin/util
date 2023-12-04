import { appContext } from '@robertakarobin/jsutil/context.ts';
import { Emitter } from '@robertakarobin/jsutil/emitter.ts';
import { newUid } from '@robertakarobin/jsutil/index.ts';

export type BoundElement = Element & {
	[Component.$elInstance]: Component; // Attaching instances to Elements should prevent the instance from being garbage-collected until the Element is GCd
};

export const globals = (appContext === `browser` ? window : global) as unknown as Window
	& { [key in typeof Component.name]: typeof Component; }
	& { [key in typeof Component.unhydratedInstancesName]: Map<Component[`id`], Component> }
	& { [key in typeof Component.unhydratedDataName]: Record<Component[`id`], object> };

export class Component<State = any> extends Emitter<State> { // eslint-disable-line @typescript-eslint/no-explicit-any
	static readonly $elAttrId = `data-id`;
	static readonly $elAttrType = `data-component`;
	static readonly $elInstance = `instance`;
	private static readonly persists = new Map<Component[`id`], Component>();
	private static readonly renderOrder = new Set<Component>();
	static readonly style: string | undefined;
	static readonly subclasses = new Map<string, typeof Component>();
	static readonly unhydratedDataName = `unhydratedArgs`;
	static readonly unhydratedInstancesName = `unhydratedInstances`; // Reusing this for both the <script> and the global variable

	static {
		globals[this.name] = this;
		globals[Component.unhydratedInstancesName] = new Map();
	}

	static createUid() {
		return `i${newUid()}`; // [id] must begin with a letter
	}

	/**
	 * Should run after the page is done loading
	 */
	static init() {
		Component.subclasses.set(this.name, this);
		this.setStyle();
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
	$els = new Set<WeakRef<BoundElement>>();
	content = ``;
	/**
	 * @returns The instance's constructor
	 */
	get Ctor() {
		return this.constructor as typeof Component;
	}
	readonly id: string;
	/**
	* If true, a <script> tag will be inserted that allows this component to be dynamically rendered. Otherwise it will be rendered only once. TODO2: Preserve isCSR=false elements
	*/
	readonly isCSR: boolean = true;
	isPersisted: boolean = false;
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

	constructor(args?: { id?: string; } & State) {
		super({ initial: args });

		if (args?.id !== undefined) {
			this.id = args.id;

			const existing = Component.persists.get(this.id);
			if (existing) {
				// console.log(`${this.Ctor.name} ${this.id} found`);
				return existing as this;
			} else {
				this.isPersisted = true;
				// console.log(`${this.Ctor.name} ${this.id} persisting`);
				Component.persists.set(this.id, this);
			}
		} else {
			this.id = Component.createUid();
		}

		// console.log(`${this.Ctor.name} ${this.id} created`);
		if (!Component.subclasses.has(this.Ctor.name)) {
			this.Ctor.init();
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

		for (const ref of this.$els) {
			const $el = ref.deref();
			if ($el === undefined) {
				this.$els.delete(ref);
				continue;
			}

			const $match = $el.closest(selector);
			if ($match) {
				if (typeof Ancestor === `string`) {
					return $match;
				}
				return ($match as BoundElement).instance;
			}
		}
	}

	find(Descendant: string): Element;
	find<Descendant extends typeof Component>(Descendant: Descendant): Descendant;
	find<Descendant extends typeof Component>(Descendant: Descendant | string) {
		const selector = typeof Descendant === `string`
			? Descendant
			: `[${Component.$elAttrType}=${Descendant.name}]`;

		for (const ref of this.$els) {
			const $el = ref.deref();
			if ($el === undefined) {
				this.$els.delete(ref);
				continue;
			}

			const $match = $el.closest(selector);
			if ($match) {
				if (typeof Descendant === `string`) {
					return $match;
				}
				return ($match as BoundElement).instance;
			}
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

		for (const ref of this.$els) {
			const $el = ref.deref();
			if ($el === undefined) {
				this.$els.delete(ref);
				continue;
			}

			const $descendants = $el.querySelectorAll(selector);;
			if (typeof Descendant === `string`) {
				descendants.push(...Array.from($descendants));
				continue;
			}

			for (const $descendant of $descendants as NodeListOf<BoundElement>) {
				descendants.push($descendant.instance as InstanceType<Descendant>);
			}
		}
		return descendants;
	}

	hydrate($root: Element) {
		const unhydratedInstances = globals[Component.unhydratedInstancesName];
		unhydratedInstances.clear();

		const unhydratedArgs = globals[Component.unhydratedDataName];

		const hydratedInstances = new Map<Component[`id`], Component>();

		const $firstOfThisType = $root.querySelector(`[${Component.$elAttrType}=${this.Ctor.name}]`);
		if ($firstOfThisType) {
			const id = $firstOfThisType.getAttribute(Component.$elAttrId);
			Object.assign(this, { id }); // ID is readonly, but we want to override it here
			hydratedInstances.set(this.id, this);
			this.render();
		}

		const $els = $root.querySelectorAll(`[${Component.$elAttrType}]`);
		for (const $el of Array.from($els) as Array<BoundElement>) {
			const id = $el.getAttribute(Component.$elAttrId)!;

			let instance = hydratedInstances.get(id);
			if (instance === undefined) {
				const constructorName = $el.getAttribute(Component.$elAttrType)!;
				const Constructor = Component.subclasses.get(constructorName)!;
				const args = unhydratedArgs[id];
				instance = new Constructor(args);
				hydratedInstances.set(id, instance);
			}

			instance.setEl($el);
			$el[Component.$elInstance] = instance;
		}

		document.getElementById(Component.unhydratedDataName)?.remove();
		globals[Component.unhydratedDataName] = {};
	}

	onLoad() {}

	/**
	 * Outputs the template to a string
	 * @param content Any content that should be injected into the template
	 */
	render(content: string = ``) {
		Component.renderOrder.add(this);
		return this.template(content);
	}

	rerender() {
		Component.renderOrder.clear();
		const parser = new DOMParser();
		const rendered = this.template();
		const doc = parser.parseFromString(rendered, `text/html`);
	}

	setEl($input: Element) {
		const $el = $input as BoundElement;
		$el[Component.$elInstance] = this;
		$el.setAttribute(Component.$elAttrType, this.Ctor.name);
		$el.setAttribute(Component.$elAttrId, this.id);
		this.$els.add(new WeakRef($el));
		this.onLoad();
	}

	/**
	 * Defines what is written into the document when this instance is rendered
	 */
	template(content: string = ``): string {
		return content ?? ``;
	}
}
