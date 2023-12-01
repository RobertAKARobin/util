import type * as $ from '@robertakarobin/jsutil/types.d.ts';
import type { Emitter, OnEmit } from '@robertakarobin/jsutil/emitter.ts';
import { newUid } from '@robertakarobin/jsutil/index.ts';

import { appContext } from './context.ts';

type BoundElement = Element & {
	[Component.$elInstance]: Component; // Attaching instances to Elements should prevent the instance from being garbage-collected until the Element is GCd
};

type DerivedComponent<Subclass extends Component> = {
	new(...args: Array<any>): Subclass; // eslint-disable-line @typescript-eslint/no-explicit-any
} & Pick<typeof Component, `init`>;

type SsgHolder = Array<
	[Element, typeof Component.name, Component[`id`]]
>;

const globals = (appContext === `browser` ? window : global) as unknown as Window
	& { [key in typeof Component.name]: typeof Component; }
	& { [key in typeof Component.ssgHolderName]: SsgHolder; };

export abstract class Component<Subclass extends Component = never> { // This generic lets `this.bind` work; without it `instance.bind` works but `this.bind` throws a type error
	static readonly $elAttrId = `id`;
	static readonly $elAttrType = `data-component`;
	static readonly $elInstance = `instance`;
	private static readonly instances = new Map<Component[`id`], Component>();
	static readonly ssgHolderName = `ssgInstances`;
	static readonly ssgHolderScript = `window.${Component.ssgHolderName}=window.${Component.ssgHolderName}||[];`;
	private static readonly ssgsToConstruct = globals[this.ssgHolderName];
	static readonly style: string | undefined;
	static readonly subclasses = new Map<string, typeof Component>();
	private static readonly toPlace = new Map<Component[`id`], Component>();

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
			const [$placeholder, componentName, id] = ssg;
			if (componentName !== this.name) {
				this.ssgsToConstruct.push(ssg); // Persist not-yet-initialized components
				continue;
			}

			const instance = new (this as unknown as Subclass)(id);
			instance.setEl($placeholder.nextElementSibling!);
			$placeholder.remove();
		}
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
		this.constructSsgs();
	}

	static onPlace(id: Component[`id`], $placeholder: Element) {
		let instance = Component.toPlace.get(id);
		if (instance === undefined) {
			throw new Error(`onPlace: Could not find instance #${id}`);
		}

		Component.toPlace.delete(id);

		if (Component.instances.has(id)) {
			instance = Component.instances.get(id)!;
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
	 * Gets or creates the Component with the specified ID, if any
	 */
	static toFunction<Instance, Args extends Array<any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
		Constructor: new (...args: Args) => Instance
	) { // Reveisit when/if Typescript supports generics in abstract statics https://github.com/microsoft/TypeScript/issues/34665
		(Constructor as unknown as typeof Component).init();

		return (...args: ConstructorParameters<typeof Constructor>) => {
			const id = args[0] as Component[`id`];
			const instance = id !== undefined && Component.instances.has(id)
				? Component.instances.get(id)!
				: new Constructor(...args);
			return instance as Instance;
		};
	}

	/**
	 * The element to which this instance is bound
	 */
	$el: Element | undefined;
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
	readonly id: string;
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
	 * Warning: `style` should be defined as a static property, not an instance property
	*/
	private readonly style: void = undefined;

	constructor({ id, ...attributes }: {
		id?: string;
	} = {}) {
		this.attributes = attributes;
		this.id = id ?? Component.createUid();

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

	find<Subclass extends DerivedComponent<Component>>(
		subclass: Subclass, id?: Component[`id`]
	) {
		const $child: BoundElement = this.$el!.querySelector(id === undefined
			? `[${Component.$elAttrType}=${subclass.name}]`
			: `[${Component.$elAttrId}=${id}]`
		)!;
		return $child.instance as InstanceType<Subclass>; // eslint-disable-line @typescript-eslint/no-unsafe-return
	}

	findAll<Subclass extends DerivedComponent<Component>>(
		subclass: Subclass
	) {
		const $children = this.$el?.querySelectorAll(`[${Component.$elAttrType}=${subclass.name}]`);
		if ($children === undefined) {
			return [];
		}
		return Array.from($children).map(
			$child => ($child as BoundElement).instance
		) as Array<InstanceType<Subclass>> ; // eslint-disable-line @typescript-eslint/no-unsafe-return
	}

	on<
		Key extends $.KeysMatching<Subclass, Emitter<any>>, // eslint-disable-line @typescript-eslint/no-explicit-any
		Type extends Subclass[Key] extends Emitter<infer T> ? T : never,
	>(
		key: Key,
		doWhat: OnEmit<Type>
	) {
		const emitter = (this as unknown as Subclass)[key] as Emitter<Type>;
		emitter.subscribe(doWhat);
		return this;
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
			`${match} ${Component.$elAttrType}="${this.Ctor.name}" ${Component.$elAttrId}="${this.id}"`
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
