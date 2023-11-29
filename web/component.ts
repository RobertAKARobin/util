import type * as $ from '@robertakarobin/jsutil/types.d.ts';
import { Emitter, type Subscription } from '@robertakarobin/jsutil/emitter.ts';

import { appContext } from './context.ts';

type BoundElement = Element & {
	[Component.$elInstance]: Component; // Attaching instances to Elements should prevent the instance from being garbage-collected until the Element is GCd
};

type DerivedComponent<Subclass extends Component> = {
	new(...args: Array<any>): Subclass; // eslint-disable-line @typescript-eslint/no-explicit-any
} & Pick<typeof Component, `init`>;

const globals = (appContext === `browser` ? window : global) as unknown as Window & {
	[key in typeof Component.name]: typeof Component;
};

export abstract class Component<Subclass extends Component = never> { // This generic lets `this.bind` work; without it `instance.bind` works but `this.bind` throws a type error
	static readonly $elAttribute = `data-component`;
	static readonly $elInstance = `instance`;
	static readonly style: string | undefined;
	static readonly subclasses = new Map<string, typeof Component>();
	static readonly toInit = globals[this.name] as unknown as Array<
		[Element, typeof Component.name, Record<string, unknown>]
	>;
	static readonly toPlace = new Map<Component[`uid`], Component>();
	static readonly uidInstances = new Map<Component[`uid`], Component>();

	static {
		globals[this.name] = this;
	}

	static createUid() {
		return Math.random().toString(36).slice(-5); // TODO2: Better UID generator. Doesn't have to actually be unique, just unlikely to repeat within app
	}

	static init<
		Instance extends Component,
		Subclass extends DerivedComponent<Instance>,
	>() {
		Component.subclasses.set(this.name, this);

		if (appContext !== `browser`) {
			return;
		}

		if (
			typeof this.style === `string`
			&& document.querySelector(`style[${this.$elAttribute}="${this.name}"]`) === null
		) {
			const $style = document.createElement(`style`);
			$style.textContent = this.style;
			$style.setAttribute(Component.$elAttribute, this.name);
			document.head.appendChild($style);
		}

		const toInit = [...this.toInit];
		this.toInit.splice(0, this.toInit.length); // Want to remove valid items from array. JS doesn't really have a good way to do that, so instead clearing and rebuilding the array
		for (let index = 0, length = toInit.length; index < length; index += 1) {
			const item = toInit[index];
			const [$placeholder, componentName, args] = item;
			if (componentName !== this.name) {
				this.toInit.push(item); // Persist not-yet-initialized components
				continue;
			}

			const instance = new (this as unknown as Subclass)();
			instance.set(args as Record<string, string>);
			instance.setEl($placeholder.nextElementSibling!);
			$placeholder.remove();
		}
	}

	static onPlace(uid: Component[`uid`], $placeholder: Element) {
		const instance = Component.toPlace.get(uid);
		if (instance === undefined) {
			throw new Error(`onPlace: Could not find instance #${uid}`);
		}

		Component.toPlace.delete(uid);

		instance.setEl($placeholder.nextElementSibling!);
		$placeholder.remove();
	}

	/**
	 * Gets or creates the Component with the specified UID, if any
	 */
	static toFunction<Instance, Args extends Array<any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
		Constructor: new (...args: Args) => Instance
	) { // Reveisit when/if Typescript supports generics in abstract statics https://github.com/microsoft/TypeScript/issues/34665
		(Constructor as unknown as typeof Component).init();

		return (...args: ConstructorParameters<typeof Constructor>) => {
			const uid = args[0] as Component[`uid`];
			const instance = uid !== undefined && Component.uidInstances.has(uid)
				? Component.uidInstances.get(uid)!
				: new Constructor(...args);
			return instance as Instance;
		};
	}

	get $() {
		return this.state.last;
	}
	$el: Element | undefined;
	args: Component[`attributes`] = {};
	/**
	 * Properties that can be turned into HTML attributes with `.attrs()`
	 */
	attributes: Record<string, string | symbol | number | boolean> = {};
	get Ctor() {
		return this.constructor as typeof Component;
	}
	/**
	* If true, a <script> tag will be inserted that allows this component to be dynamically rendered. Otherwise it will be rendered only once. TODO2: Preserve isCSR=false elements
	*/
	isCSR = true;
	/**
	 * If true, if this is a Page it will be compiled into a static `.html` file at the route(s) used for this Page, which serves as a landing page for performance and SEO purposes.
	 * If this is a Component it will be compiled into static HTML included in the landing page.
	 * Not a static variable because a Component/Page may/may not want to be SSG based on certain conditions
	*/
	isSSG = true;
	readonly load = new Emitter<number>({ initial: 0 });
	readonly state = new Emitter<ReturnType<this[`accept`]>>({ initial: {} as ReturnType<this[`accept`]> });
	/**
	 * Warning: `style` should be defined as a static property, not an instance property
	*/
	private readonly style: void = undefined;
	/**
	 * This instance's subscriptions. This should keep subscriptions from being garbage-collected as long as the instance persists?
	 */
	protected readonly subscriptions = new Set<Subscription<any>>(); // eslint-disable-line @typescript-eslint/no-explicit-any

	constructor(
		readonly uid?: string
	) {
		this.uid = uid?.toString() ?? Component.createUid();

		if (uid !== undefined) {
			Component.uidInstances.set(this.uid.toString(), this);
		}

		if (!Component.subclasses.has(this.Ctor.name)) {
			this.Ctor.init<typeof this, DerivedComponent<typeof this>>();
		}
	}

	accept(input: Component[`attributes`]) { // eslint-disable-line @typescript-eslint/no-explicit-any
		return input as any; // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
	}

	/**
	 * Returns the component's `.attributes` and the provided dict as HTML attributes
	 */
	attrs(input: Component[`attributes`] = {}) {
		return Object.entries({ ...this.attributes, ...input })
			.map(([key, value]) => `${key}="${String(value)}"`)
			.join(` `);
	}

	/**
	 * Returns a JavaScript string that can be assigned to an HTML event attribute to call the given method with the given arguments
	 * Arguments must be strings or numbers since other data types can't really be written onto the DOM
	 * @example `<button onclick=${this.bind(`onClick`, `4.99`)}>$4.99</button>`
	 */
	protected bind<Key extends $.KeysMatching<Subclass, (...args: any) => any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
		methodName: Key,
		...args: Array<string | number> | []
	) {
		const argsString = args.map(arg => {
			if (typeof arg === `string`) {
				return `'${arg}'`;
			}
			return arg;
		}).join(`,`);
		return `"this.closest('[${Component.$elAttribute}=&quot;${this.Ctor.name}&quot;]').${Component.$elInstance}.${methodName as string}(event,${argsString})"`; // &quot; is apprently the correct way to escape quotes in HTML attributes
	}

	on<
		EmitterValue,
		SpecificEmitter extends Emitter<EmitterValue>,
		Key extends $.KeysMatching<Subclass, SpecificEmitter>
	>(
		eventName: Key,
		...[onEmit, options]: Parameters<SpecificEmitter[`subscribe`]>
	) {
		const emitter = (this as unknown as Subclass)[eventName] as SpecificEmitter;
		const subscription = emitter.subscribe(onEmit, options);
		this.subscriptions.add(subscription);
		return this;
	}

	render(content: Parameters<this[`template`]>[0] = ``) {
		Component.toPlace.set(this.uid, this);

		const key = Component.name;
		return `<img src="#" style="display:none" onerror="${key}.${Component.onPlace.name}('${this.uid}', this)" />${this.template(content)}`;
	}

	/**
	 * Set values on this Component's state
	 */
	set(input: Parameters<this[`accept`]>[0]): this {
		this.args = input;
		const state = this.accept(input); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
		this.state.next(state); // eslint-disable-line @typescript-eslint/no-unsafe-argument
		return this;
	}

	setEl($input: Element) {
		if ($input === undefined || $input === null) {
			throw new Error(`onRender: ${this.Ctor.name} #${this.uid} has no element`);
		}
		const $el = $input as BoundElement;
		$el[Component.$elInstance] = this;
		$el.setAttribute(Component.$elAttribute, this.Ctor.name);
		this.$el = $el;
		this.load.next(this.load.last + 1);
	}

	template(content: string = ``): string {
		return content ?? ``;
	}
}
