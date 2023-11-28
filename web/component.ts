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

export abstract class Component {
	static readonly $elAttribute = `data-component`;
	static readonly $elInstance = `instance`;
	static readonly style: string | undefined;
	static readonly subclasses = new Map<string, typeof Component>();
	static readonly toInit = globals[this.name] as unknown as Array<
		[Element, typeof Component.name, Record<string, unknown>]
	>;
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

			const instance = new (this as unknown as Subclass)(args);
			instance.$el = $placeholder.nextElementSibling! as BoundElement;
			$placeholder.remove();
			instance.onRender();
		}
	}

	/**
	 * Callback used by placeholder elements in [onload]/[onerror]
	 */
	static onPlace(
		uid: Component[`uid`],
		$placeholder: Element,
	): void {
		const instance = Component.uidInstances.get(uid);
		if (instance === undefined) {
			throw new Error(`Could not find ${this.name} instance #${uid}`);
		}
		instance.$el = $placeholder as BoundElement;
		instance.render();
	}

	/**
	 * Overridden in build.ts
	 */
	static placeSSG(_instance: Component, _args: unknown) {
		return ``;
	}

	/**
	 * Combines Component's constructor and template into a single function, and returns a string that, when read by the browser, will hydrate the Component
	 */
	static toFunction<
		Instance extends Component,
		Subclass extends DerivedComponent<Instance>,
	>(Constructor: Subclass) {
		Constructor.init();

		return (args: ConstructorParameters<Subclass>[0]) => {
			const uid = args.uid as Component[`uid`];
			const instance = (
				uid !== undefined && Component.uidInstances.has(uid)
					? Component.uidInstances.get(uid)!
					: new Constructor(args)
			);
			if (appContext === `build`) {
				return Component.placeSSG(instance, args);
			}
			return instance.place();
		};
	}

	$el: Element | undefined;
	/**
	 * Properties that can be turned into HTML attributes with `.attrs()`
	 */
	attributes: Record<string, string | number | boolean>;
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
	/**
	 * Warning: `style` should be defined as a static property, not an instance property
	 */
	private readonly style: void = undefined;
	abstract template: () => string;
	readonly uid: string;

	constructor(
		{ uid, ...attributes }: Record<string, string | number | boolean> = {}
	) {
		this.uid = uid?.toString() ?? Component.createUid();
		this.attributes = attributes;

		Component.uidInstances.set(this.uid.toString(), this); // TODO1: Memory leak!

		if (!Component.subclasses.has(this.Ctor.name)) {
			this.Ctor.init<typeof this, DerivedComponent<typeof this>>();
		}
	}

	/**
	 * Returns the component's `.attributes` and the provided dict as HTML attributes
	 */
	attrs(input: typeof this[`attributes`] = {}) {
		return Object.entries({ ...this.attributes, ...input })
			.map(([key, value]) => `${key}="${value}"`)
			.join(` `);
	}

	/**
	 * Returns a JavaScript string that can be assigned to an HTML event attribute to call the given method with the given arguments
	 * Arguments must be strings or numbers since other data types can't really be written onto the DOM
	 * @example `<button onclick=${this.bind(`onClick`, `4.99`)}>$4.99</button>`
	 */
	bind(
		methodName: keyof this, // TODO2: Stronger typing; should only accept methods
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

	onRender() {
		if (this.$el === undefined || this.$el === null) {
			throw new Error(`onRender: ${this.Ctor.name} #${this.uid} has no element`);
		}
		const $el = this.$el as BoundElement;
		$el.setAttribute(Component.$elAttribute, this.Ctor.name);
		$el[Component.$elInstance] = this;
	}

	place() {
		const key = Component.name;
		return `<img src="" style="display:none" onerror="${key}.onPlace('${this.uid}', this)" />`;
	}

	/**
	 * Replace the instance's `$el` with updated HTML
	 */
	render() {
		const $el = this.$el!;
		if ($el === undefined) {
			throw new Error(`render: ${this.Ctor.name} #${this.uid} has no element`);
		}
		while ($el.firstChild) {
			$el.removeChild($el.lastChild!);
		}
		$el.insertAdjacentHTML(`afterend`, this.template());
		this.$el = $el.nextElementSibling!;
		$el.remove();
		this.onRender();
	}
}
