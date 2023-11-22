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

const instancesKey = `instances`;

export abstract class Component {
	static readonly $elAttribute = `data-component`;
	static readonly $elInstances = `instances`;
	static readonly [instancesKey] = new Map<Component[`uid`], WeakRef<Component>>(); // A garbage-collectible way to reference all instances. Instances should be GCd when the corresponding HTML element is GCd. See BoundElement
	static readonly onloaders = globals[this.name] as unknown as Record<
		Component[`uid`],
		[BoundElement, typeof Component.name, unknown]
	>;
	static readonly style: string | undefined;

	static {
		globals[this.name] = this;
	}

	static createUid() {
		while(true) {
			const uid = Math.random().toString(36).slice(-5);
			if (!Component[instancesKey].has(uid)) {
				return uid;
			}
		}
	}

	/**
	 * Applies the given component's styles, hydrates the component data defined during SSG, and returns a helper function for rendering components
	 */
	static register<
		Instance extends Component,
		Subclass extends DerivedComponent<Instance>,
		Args extends (
			Subclass extends { new(...args: infer Args): Instance; } ? Args : never
		)
	>(Constructor: { new(...args: Args): Instance; } & Pick<typeof Component, `style`>) {
		if (
			appContext === `browser`
			&& typeof Constructor.style === `string`
			&& document.querySelector(`style[${this.$elAttribute}="${Constructor.name}"]`) === null
		) {
			const $style = document.createElement(`style`);
			$style.textContent = Constructor.style;
			$style.setAttribute(Component.$elAttribute, Constructor.name);
			document.head.appendChild($style);
		}

		for (const uid in this.onloaders) {
			const [$placeholder, componentName, ...args] = this.onloaders[uid];
			if (componentName !== Constructor.name) {
				continue;
			}
			delete this.onloaders[uid];
			const instance = new Constructor(...args as unknown as Args);
			const $el = $placeholder.nextElementSibling as BoundElement;
			instance.uid = uid;
			instance.$el = $el;
			$el[Component.$elInstances] = $el[Component.$elInstances] ?? new Map();
			$el[Component.$elInstances].set(uid, instance);
			$el.setAttribute(`data-${Constructor.name}`, instance.uid);
			$placeholder.remove();
			instance.onload();
		}

		return (...args: ConstructorParameters<typeof Constructor>) => {
			const instance = new Constructor(...args);
			const key = Component.name;
			const argsString = args.map(arg => typeof arg === `string` ? `'${arg}'` : `${arg}`).join(`,`);
			instance.placeholder = `<script src="data:text/javascript," onload="window.${key}=window.${key}||{};window.${key}['${instance.uid}']=[this,'${Constructor.name}',${argsString}]"></script>`; // Need an element that is valid HTML anywhere, will trigger an action when it is rendered, and can provide a reference to itself, its constructor type, and the instance's constructor args
			return instance;
		};
	}

	$el: HTMLElement | undefined;
	readonly children = new Set<Component>();
	private placeholder?: string;
	/**
	 * Error: `style` should be defined as a static property, not an instance property
	 */
	private readonly style: void = undefined;
	abstract template: () => string;
	uid: string = Component.createUid();

	constructor(
		public attributes: Record<string, string> = {}
	) {}

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

	/**
	 * Given a child component, set the child's parent to this instance, and render the child
	 */
	put<ChildInstance extends Component>(child: ChildInstance): string {
		this.children.add(child);
		return child.render();
	}

	/**
	 * Returns this instance's HTML as a string, along with a <script> that will allow the instance to be attached to its topmost HTML element
	 */
	render() {
		return `${this.placeholder}${this.template()}`;
	}

	/**
	 * Replace the instance's `$el` with updated HTML
	 */
	rerender() { // TODO1: A better rerender
		this.$el!.innerHTML = this.template();
	}
}
