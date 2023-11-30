import type * as $ from '@robertakarobin/jsutil/types.d.ts';
import { Emitter, type OnEmit, type Subscription } from '@robertakarobin/jsutil/emitter.ts';
import { newUid } from '@robertakarobin/jsutil/index.ts';

import { appContext } from './context.ts';

type BoundElement = Element & {
	[Component.$elInstance]: Component; // Attaching instances to Elements should prevent the instance from being garbage-collected until the Element is GCd
};

type DerivedComponent<Subclass extends Component> = {
	new(...args: Array<any>): Subclass; // eslint-disable-line @typescript-eslint/no-explicit-any
} & Pick<typeof Component, `init`>;

type SsgHolder = Array<
	[Element, typeof Component.name, Component[`uid`], Record<string, unknown>]
>;

const globals = (appContext === `browser` ? window : global) as unknown as Window
	& { [key in typeof Component.name]: typeof Component; }
	& { [key in typeof Component.ssgHolderName]: SsgHolder; };

export abstract class Component<Subclass extends Component = never> { // This generic lets `this.bind` work; without it `instance.bind` works but `this.bind` throws a type error
	static readonly $elAttrType = `data-component`;
	static readonly $elAttrUid = `data-uid`;
	static readonly $elInstance = `instance`;
	private static readonly persists = new Map<Component[`uid`], Component>();
	static readonly ssgHolderName = `ssgInstances`;
	static readonly ssgHolderScript = `window.${Component.ssgHolderName}=window.${Component.ssgHolderName}||[];`;
	private static readonly ssgsToConstruct = globals[this.ssgHolderName];
	static readonly style: string | undefined;
	static readonly subclasses = new Map<string, typeof Component>();
	private static readonly toPlace = new Map<Component[`uid`], Component>();

	static {
		globals[this.name] = this;
	}

	/**
	 * Hydrate instances for all the SSG elements on the page when it loads
	 */
	static constructSsgs<
		Instance extends Component,
		Subclass extends DerivedComponent<Instance>
	>() {
		if (appContext !== `browser`) {
			return;
		}

		const ssgsToConstruct = [...this.ssgsToConstruct];
		this.ssgsToConstruct.splice(0, this.ssgsToConstruct.length); // Want to remove valid items from array. JS doesn't really have a good way to do that, so instead clearing and rebuilding the array
		for (let index = 0, length = ssgsToConstruct.length; index < length; index += 1) {
			const ssg = ssgsToConstruct[index];
			const [$placeholder, componentName, uid, args] = ssg;
			if (componentName !== this.name) {
				this.ssgsToConstruct.push(ssg); // Persist not-yet-initialized components
				continue;
			}

			const instance = new (this as unknown as Subclass)(uid);
			instance.set(args as Record<string, string>);
			instance.setEl($placeholder.nextElementSibling!);
			$placeholder.remove();
		}
	}

	static createUid() {
		return newUid();
	}

	/**
	 * Should run after the page is done loading
	 */
	static init() {
		Component.subclasses.set(this.name, this);
		this.setStyle();
		this.constructSsgs();
	}

	static onPlace(uid: Component[`uid`], $placeholder: Element) {
		let instance = Component.toPlace.get(uid);
		if (instance === undefined) {
			throw new Error(`onPlace: Could not find instance #${uid}`);
		}

		Component.toPlace.delete(uid);

		if (Component.persists.has(uid)) {
			instance = Component.persists.get(uid)!;
		}

		$placeholder.replaceWith(instance.renderCSR());
	}

	/**
	 * Serialize an object as a native JS value so that it can be included in `[on*]` attributes. TODO2: Use JSON5 or something robust
	 */
	static serialize(input: any): string { // eslint-disable-line @typescript-eslint/no-explicit-any
		if (input === null || input === undefined) {
			return ``;
		}
		if (Array.isArray(input)) {
			return `[${input.map(Component.serialize).join(`,`)}]`;
		}
		if (typeof input === `object`) {
			let out = ``;
			for (const property in input) {
				const value = input[property] as Record<string, unknown>; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
				out += `${property.replaceAll(`"`, `&quot;`)}:${Component.serialize(value)},`;
			}
			return `{${out}}`;
		}
		if (typeof input === `string`) {
			const out = input
				.replaceAll(`"`, `&quot;`)
				.replaceAll(`'`, `\\'`);
			return `'${out}'`;
		}
		return input.toString(); // eslint-disable-line
	};

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
	 * Gets or creates the Component with the specified UID, if any
	 */
	static toFunction<Instance, Args extends Array<any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
		Constructor: new (...args: Args) => Instance
	) { // Reveisit when/if Typescript supports generics in abstract statics https://github.com/microsoft/TypeScript/issues/34665
		(Constructor as unknown as typeof Component).init();

		return (...args: ConstructorParameters<typeof Constructor>) => {
			const uid = args[0] as Component[`uid`];
			const instance = uid !== undefined && Component.persists.has(uid)
				? Component.persists.get(uid)!
				: new Constructor(...args);
			return instance as Instance;
		};
	}

	/**
	 * The element to which this instance is bound
	 */
	$el: Element | undefined;
	/**
	 * This instance's subscriptions. This should keep subscriptions from being garbage-collected as long as the instance persists?
	 */
	protected readonly _subscriptions = new Set<Subscription<any>>(); // eslint-disable-line @typescript-eslint/no-explicit-any
	/**
	 * Holds the last arguments passed into the instance. TODO2: A more elegant way to do this?
	 */
	args: Component[`attributes`] = {};
	/**
	 * Properties that can be turned into HTML attributes with `.attrs()`
	*/
	attributes: Record<string, string | symbol | number | boolean> = {};
	content: string | undefined;
	/**
	 * @returns The instance's constructor
	 */
	get Ctor() {
		return this.constructor as typeof Component;
	}
	/**
	* If true, a <script> tag will be inserted that allows this component to be dynamically rendered. Otherwise it will be rendered only once. TODO2: Preserve isCSR=false elements
	*/
	readonly isCSR: boolean = true;
	/**
	 * If true, if this is a Page it will be compiled into a static `.html` file at the route(s) used for this Page, which serves as a landing page for performance and SEO purposes.
	 * If this is a Component it will be compiled into static HTML included in the landing page.
	 * Not a static variable because a Component/Page may/may not want to be SSG based on certain conditions
	*/
	readonly isPersisted: boolean = false;
	readonly isSSG: boolean = true;
	/**
	 * Emits when the component is rendered
	 */
	readonly load = new Emitter<number>({ initial: 0 });
	/**
	 * Emits when the state changes
	 */
	readonly state = new Emitter<ReturnType<this[`accept`]>>({ initial: {} as ReturnType<this[`accept`]> });
	/**
	 * Warning: `style` should be defined as a static property, not an instance property
	*/
	private readonly style: void = undefined;

	constructor(
		readonly uid?: string
	) {
		this.uid = uid ?? Component.createUid();

		if (uid !== undefined) {
			Component.persists.set(this.uid, this);
			this.isPersisted = true;
		}

		if (!Component.subclasses.has(this.Ctor.name)) {
			this.Ctor.init();
		}
	}

	/**
	 * @param input An object, the type of which defines the parameters the component should accept via `.set` when used in a template
	 * @returns An object, the type of which defines the shape of the component's `.state`
	 */
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
		return `"this.closest('[${Component.$elAttrType}=${this.Ctor.name}]').${Component.$elInstance}.${methodName as string}(event,${argsString})"`;
	}

	notify<
		SpecificEmitter extends Emitter<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
		Key extends $.KeysMatching<Subclass, SpecificEmitter>
	>(
		receiver: {
			onNotify: Component<any>[`onNotify`]; // eslint-disable-line @typescript-eslint/no-explicit-any
			uid?: Component<any>[`uid`]; // eslint-disable-line @typescript-eslint/no-explicit-any
		},
		eventName: Key,
	) {
		const emitter = (this as unknown as Subclass)[eventName] as SpecificEmitter;
		const subscription = emitter.subscribe((...args) => receiver.onNotify(this, ...args));
		this._subscriptions.add(subscription);
		return this;
	}

	onLoad() {}

	onNotify(_instance: Component<any>, ..._args: Parameters<OnEmit<any>>) {} // eslint-disable-line @typescript-eslint/no-explicit-any

	place() {
		const key = Component.name;
		return `<img aria-hidden="true" src="#" style="display:none" onerror="${key}.${Component.onPlace.name}('${this.uid}',this)" />`; // TODO1: (I think) this causes an unnecessary rerender on existing elements
	}

	/**
	 * Outputs the template to a string
	 * @param content Any content that should be injected into the template
	 */
	render(content: string = ``) {
		this.content = content;
		Component.toPlace.set(this.uid, this);
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
		const argsString = Component.serialize(this.args);
		const template = this.template().trim();
		const hasOneRootElement = /^<(\w+).*<\/\1>$/s.test(template); // TODO2: False positive for e.g. <div>one</div> <div>two</div>
		const isOneElement = /^<[^<>]+>$/s.test(template);
		if (!hasOneRootElement && !isOneElement) {
			throw new Error(`Template for ${this.Ctor.name} invalid: Component templates must have one root HTML element`);
		}
		let out = ``;
		if (this.isCSR) {
			out += `<script src="data:text/javascript," onload="${Component.ssgHolderName}.push([this,'${this.Ctor.name}',${this.isPersisted ? `'${this.uid}'` : ``},${argsString}])"></script>`; // Need an element that is valid HTML anywhere, will trigger an action when it is rendered, and can provide a reference to itself, its constructor type, and the instance's constructor args. TODO2: A less-bad way of passing arguments. Did it this way because it's the least-ugly way of serializing objects, but does output double-quotes so can't put it in the `onload` function without a lot of replacing
		}
		if (this.isSSG) {
			let rendered = this.template(this.content);
			rendered = rendered.replace(/^\s*<\w+/, match =>
				`${match} ${Component.$elAttrType}="${this.Ctor.name}"${this.isPersisted ? ` ${Component.$elAttrUid}="${this.uid}"` : ``}`
			);
			out += rendered;
		}
		return out;
	}

	rerender() {
		this.$el!.replaceWith(this.renderCSR());
	}

	/**
	 * Sets values on this Component's state
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
		$el.setAttribute(Component.$elAttrType, this.Ctor.name);
		$el.setAttribute(Component.$elAttrUid, this.uid!);
		this.$el = $el;
		this.load.next(this.load.last + 1);
		this.onLoad();
	}

	/**
	 * Defines what is written into the document when this instance is rendered
	 */
	template(content: string = ``): string {
		return content ?? ``;
	}
}
