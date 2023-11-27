import { appContext } from './context.ts';

type BoundElement = HTMLElement & {
	[Component.$elInstances]: Map<Component[`uid`], Component>; // Attaching instances to HTMLElements should prevent the instance from being garbage-collected until the HTMLElement is GCd
};

type DerivedComponent<Subclass extends Component> = {
	new(...args: Array<any>): Subclass; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const globals = (appContext === `browser` ? window : global) as unknown as Window & {
	[key in typeof Component.name]: typeof Component;
};

export abstract class Component {
	static readonly $elAttribute = `data-component`;
	static readonly $elInstances = `instances`;
	static readonly onloaders = globals[this.name] as unknown as Record<
	Component[`uid`],
	[HTMLScriptElement, typeof Component.name, unknown]
	>;
	static readonly style: string | undefined;
	static readonly subclasses = new Map<string, typeof Component>();
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

		if (
			appContext === `browser`
			&& typeof this.style === `string`
			&& document.querySelector(`style[${this.$elAttribute}="${this.name}"]`) === null
		) {
			const $style = document.createElement(`style`);
			$style.textContent = this.style;
			$style.setAttribute(Component.$elAttribute, this.name);
			document.head.appendChild($style);
		}

		for (const uid in this.onloaders) {
			const [$placeholder, componentName] = this.onloaders[uid];
			if (componentName !== this.name) {
				continue;
			}
			delete this.onloaders[uid];
			let argsString = $placeholder.innerHTML;
			argsString = argsString.substring(2, argsString.length - 2);
			const args = JSON.parse(argsString) as (
				Subclass extends { new(args: infer Args): Instance; } ? Args : never
			);
			const instance = new (this as unknown as Subclass)({
				...args,
				uid,
			});
			const $el = $placeholder.nextElementSibling as BoundElement;
			instance.$el = $el;
			$el.setAttribute(`data-${this.name}`, uid);
			$el[Component.$elInstances] = $el[Component.$elInstances] ?? new Map();
			$el[Component.$elInstances].set(uid, instance);
			$placeholder.remove();
			instance.onload();
		}
	}

	static rerender(uid: Component[`uid`], $placeholder: HTMLScriptElement) {
		const instance = this.uidInstances.get(uid)!;
		$placeholder.replaceWith(instance.$el!);
	}

	static toFunction<
		Instance extends Component,
		Subclass extends DerivedComponent<Instance>,
		Args extends (
			Subclass extends { new(args: infer Args): Instance; } ? Args : never
		)
	>(Constructor: { new(args: Args): Instance; } & Pick<typeof Component, `style`>) {
		return (args: ConstructorParameters<typeof Constructor>[0]) => {
			const uid = args.uid as Component[`uid`];
			const instance = (
				args.uid !== undefined && Component.uidInstances.has(uid)
					? Component.uidInstances.get(uid)!
					: new Constructor(args)
			);
			if (instance.$el) {
				return instance.rerender();
			} else {
				return instance.render(args);
			}
		};
	}

	$el: HTMLElement | undefined;
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

		if (uid !== undefined) {
			Component.uidInstances.set(uid.toString(), this);
		}

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
	): string {
		const argsString = args.map(arg => {
			if (typeof arg === `string`) {
				return `'${arg}'`;
			}
			return arg;
		}).join(`,`);
		return `"this.closest('[data-${this.constructor.name}=&quot;${this.uid}&quot;]').${Component.$elInstances}.get('${this.uid.toString()}').${methodName as string}(event,${argsString})"`; // &quot; is apprently the correct way to escape quotes in HTML attributes
	}

	/**
	 * Called when the instance is first loaded
	 */
	onload() {}

	render(args: ConstructorParameters<typeof this.Ctor>[0]) {
		const key = Component.name;
		let out = ``;
		if (appContext === `build`) {
			if (this.isCSR) {
				out += `<script src="data:text/javascript," onload="window.${key}=window.${key}||{};window.${key}['${this.uid}']=[this,'${this.Ctor.name}']">/*${JSON.stringify(args)}*/</script>`; // Need an element that is valid HTML anywhere, will trigger an action when it is rendered, and can provide a reference to itself, its constructor type, and the instance's constructor args. TODO2: A less-bad way of passing arguments. Did it this way because it's the least-ugly way of serializing objects, but does output double-quotes so can't put it in the `onload` function without a lot of replacing
			}
			if (this.isSSG) {
				out += this.template();
			}
		} else {
			return this.template();
		}
		return out;
	}

	/**
	 * Replace the instance's `$el` with updated HTML
	 */
	rerender() {
		return this.template();
	}
}
