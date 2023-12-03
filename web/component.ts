import { appContext } from '@robertakarobin/jsutil/context.ts';
import { Emitter } from '@robertakarobin/jsutil/emitter.ts';
import { newUid } from '@robertakarobin/jsutil/index.ts';

type BoundElement = Element & {
	[Component.$elInstance]: Component; // Attaching instances to Elements should prevent the instance from being garbage-collected until the Element is GCd
};

const globals = (appContext === `browser` ? window : global) as unknown as Window
	& { [key in typeof Component.name]: typeof Component; };

export abstract class Component<State = any> extends Emitter<State> { // eslint-disable-line @typescript-eslint/no-explicit-any
	static readonly $elAttrId = `id`;
	static readonly $elAttrType = `data-component`;
	static readonly $elInstance = `instance`;
	private static readonly persists = new Map<Component[`id`], Component>();
	static readonly style: string | undefined;
	static readonly subclasses = new Map<string, typeof Component>();
	private static readonly toPlace = new Map<Component[`id`], Component>();

	static {
		globals[this.name] = this;
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

	static onPlace(id: Component[`id`], $placeholder: Element) {
		let instance = Component.toPlace.get(id);
		if (instance === undefined) {
			throw new Error(`onPlace: Could not find instance #${id}`);
		}

		Component.toPlace.delete(id);

		if (Component.persists.has(id)) {
			instance = Component.persists.get(id)!;
		}

		$placeholder.replaceWith(instance.renderCSR());
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
	$el: Element | undefined;
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
	/**
	 * This keeps subscriptions from being garbage-collected while this instance exists
	 */

	constructor({ id, ...initialState }:
		& { id?: string; }
		& State
	) {
		super(initialState);

		if (id !== undefined) {
			this.id = id;

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
	// protected bind<Key extends $.KeysMatching<this, Function>>(
	// 	targetName: Key,
	// 	...args: Array<string | number> | []
	// ) {
	// 	const target = this[targetName as keyof this] as Function;
	// 	const argsString = args.map(arg => {
	// 		if (typeof arg === `string`) {
	// 			return `'${arg}'`;
	// 		}
	// 		return arg;
	// 	}).join(`,`);
	// 	const out = target instanceof Emitter
	// 		? `.next(${argsString})`
	// 		: `(event,${argsString})`;
	// 	return `"this.closest('[${Component.$elAttrType}=${this.Ctor.name}]').${Component.$elInstance}.${targetName as string}${out}"`;
	// }

	closest<Ancestor extends typeof Component>(
		Ancestor: Ancestor
	) {
		const $el = this.$el!.closest(`[${Component.$elAttrType}=${Ancestor.name}]`)!;
		return ($el as BoundElement).instance as InstanceType<Ancestor>;
	}

	find<Descendant extends typeof Component>(
		Descendant: Descendant, id?: Component[`id`]
	) {
		const $descendant: BoundElement = this.$el!.querySelector(id === undefined
			? `[${Component.$elAttrType}=${Descendant.name}]`
			: `[${Component.$elAttrId}=${id}]`
		)!;
		return $descendant.instance as InstanceType<Descendant>;
	}

	findAll<Descendant extends typeof Component>(
		Descendant: Descendant
	) {
		const $children = this.$el?.querySelectorAll(`[${Component.$elAttrType}=${Descendant.name}]`);
		if ($children === undefined) {
			return [];
		}
		return Array.from($children).map(
			$child => ($child as BoundElement).instance
		) as Array<InstanceType<Descendant>>;
	}

	onLoad() {}

	place() {
		const key = Component.name;
		return `<img aria-hidden="true" src="#" style="display:none" onerror="${key}.${Component.onPlace.name}('${this.id}',this)" />`; // TODO1: (I think) this causes an unnecessary rerender on existing elements
	}

	/**
	 * Outputs the template to a string
	 * @param content Any content that should be injected into the template
	 */
	render(content: string = ``) {
		this.content = content;
		Component.toPlace.set(this.id, this);
		if (appContext === `build`) {
			return this.renderSSG();
		}
		return this.place();
	}

	private renderCSR() {
		const parser = new DOMParser();
		const rendered = this.template(this.content);
		const doc = parser.parseFromString(rendered, `text/html`);
		const $replacement = doc.body.firstElementChild!;
		this.setEl($replacement);
		return $replacement;
	}

	private renderSSG() { // TODO3: This is unused on browser, so I originally had it in build.ts, but like it better here
		const template = this.template(this.content).trim();
		const hasOneRootElement = /^<(\w+).*<\/\1>$/s.test(template); // TODO2: False positive for e.g. <div>one</div> <div>two</div>
		const isOneElement = /^<[^<>]+>$/s.test(template);
		if (!hasOneRootElement && !isOneElement) {
			throw new Error(`Template for ${this.Ctor.name} invalid: Component templates must have one root HTML element`);
		}
		let out = template;
		out = out.replace(/^\s*<\w+/, match =>
			`${match} ${Component.$elAttrType}="${this.Ctor.name}"${this.isPersisted ? ` ${Component.$elAttrId}="${this.id}"` : ``}`
		);
		return out;
	}

	rerender() {
		this.$el!.replaceWith(this.renderCSR());
	}

	setEl($input: Element) {
		if ($input === undefined || $input === null) {
			throw new Error(`onRender: ${this.Ctor.name} #${this.id} has no element`);
		}
		const $el = $input as BoundElement;
		$el[Component.$elInstance] = this;
		$el.setAttribute(Component.$elAttrType, this.Ctor.name);
		$el.setAttribute(Component.$elAttrId, this.id);
		this.$el = $el;
		this.onLoad();
	}

	/**
	 * Defines what is written into the document when this instance is rendered
	 */
	template(content: string = ``): string {
		return content ?? ``;
	}
}
