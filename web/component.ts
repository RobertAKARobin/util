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
	static readonly deconstructeds = globals[this.name] as unknown as Record<
		Component[`uid`],
		[BoundElement, typeof Component.name, unknown]
	>;
	static readonly instances = new Map<Component[`uid`], WeakRef<Component>>(); // A garbage-collectible way to reference all instances. Instances should be GCd when the corresponding HTML element is GCd. See BoundElement
	static readonly style: string | undefined;

	static {
		globals[this.name] = this;
	}

	static createUid() {
		return Math.random().toString(); // TODO2: Just has to be fairly random, not actually unique
	}

	static register<
		Instance extends Component,
		Subclass extends DerivedComponent<Instance>
	>(Constructor: Subclass) {
		if (
			appContext === `browser`
			&& typeof this.style === `string`
			&& document.querySelector(`[${this.$elInstances}="${this.name}"]`) === null
		) {
			const $style = document.createElement(`style`);
			$style.textContent = this.style;
			$style.setAttribute(this.$elInstances, this.name);
			document.head.appendChild($style);
		}

		for (const uid in this.deconstructeds) {
			const [$placeholder, componentName, ...args] = this.deconstructeds[uid];
			if (componentName !== Constructor.name) {
				continue;
			}
			delete this.deconstructeds[uid];
			const instance = new Constructor(...args);
			const $el = $placeholder.nextElementSibling as BoundElement;
			instance.uid = uid;
			instance.$el = $el;
			$el.instances = $el.instances ?? new Map();
			$el.instances.set(uid, instance);
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
	abstract template: () => string;
	uid: string = Component.createUid();

	constructor(
		public attributes: Record<string, string> = {}
	) {}

	attrs(input: typeof this[`attributes`] = {}) {
		return Object.entries({ ...this.attributes, ...input })
			.map(([key, value]) => `${key}="${value}"`)
			.join(` `);
	}

	bind(
		methodName: keyof this, // TODO2: Stronger typing; should only accept methods
		...args: Array<string> | []
	): string {
		const argsString = args.map(arg => `'${arg}'`).join(`,`);
		return `"this.closest('[data-${this.constructor.name}=&quot;${this.uid}&quot;]').${Component.$elInstances}.get('${this.uid.toString()}').${methodName as string}(event,${argsString})"`; // &quot; is apprently the correct way to escape quotes in HTML attributes
	}

	onload() {}

	put<ChildInstance extends Component>(child: ChildInstance): string {
		this.children.add(child);
		return child.render();
	}

	render() {
		return `${this.placeholder}${this.template()}`;
	}

	rerender() {
		this.$el!.innerHTML = this.template();
	}
}
