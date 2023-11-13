import type * as $ from '@robertakarobin/jsutil';

import { appContext } from './context.ts';

export const toAttributes = (input: Record<string, string>) =>
	Object.entries(input)
		.map(([key, value]) => `${key}="${value}"`)
		.join(` `);

type CachedFunction = (event: Event, ...args: Array<string>) => void;

export abstract class Component {
	private static componentsSize = 0;
	private static readonly htmlAttribute = `data-component`;
	private static readonly instanceCache = new WeakMap<HTMLElement, Component>();
	static readonly onload = new Map<string, CachedFunction>();
	static readonly styleCache = new Map<typeof Component.constructor, string>();

	static {
		if (appContext === `browser`) {
			Object.assign(window, { Component });
		}
	}

	static cached(uid: string, $descendant: HTMLElement) {
		const $root = $descendant.getAttribute(Component.htmlAttribute) === uid
			? $descendant
			: $descendant.closest(`[${Component.htmlAttribute}="${uid}"]`);
		if (!$root) {
			return;
		}
		return Component.instanceCache.get($root as HTMLElement);
	}

	static toFunction<
		Subclass extends Component
	>(Constructor: $.Type.Constructor<Subclass>) {
		return (...args: Parameters<Subclass[`render`]>) => {
			const instance = new Constructor();
			return instance.render(...args);
		};
	}

	protected static wrap(component: Component, contents: string) {
		function onload(this: HTMLElement) {
			Component.onload.delete(component.uid);

			const $anchor = this;
			const $root = $anchor.nextElementSibling as HTMLElement;
			component.$root = $root;
			try {
				$root.setAttribute(Component.htmlAttribute, component.uid);
				Component.instanceCache.set($root, component);
			} catch (error) {
				console.log(error);
				console.error(`Couldn't bind listeners for ${component.constructor.name} ${component.uid}. Make sure the component's template is valid for its surrounding HTML tags, e.g. don't put an <input> in a <p>.`);
			} finally {
				$anchor.remove();
			}
		};

		Component.onload.set(component.uid, onload);

		return `
		<img
			aria-hidden="true"
			${Component.htmlAttribute}="${component.uid}"
			onerror="Component.onload.get('${component.uid}').call(this)"
			src=""
			style="display:none"
			/>
		${contents}
		`;
	}

	protected $root?: HTMLElement;
	readonly style?: string;
	readonly uid: string;

	constructor() {
		this.uid = `c${Component.componentsSize++}`;
	}

	bind( // TODO2: Stronger typing on this
		methodName: keyof this,
		...args: Array<string> | []
	): string {
		if (appContext !== `browser`) {
			return `""`;
		}
		const argsString = args.map(arg => `'${arg}'`).join(``);
		return `"Component.cached('${this.uid}', this).${methodName as string}(event, ${argsString})"`;
	}

	render(
		...args: Parameters<this[`template`]>
	): ReturnType<this[`template`]> {
		const rendered = this.template(...args) as ReturnType<this[`template`]>;

		if (typeof(this.style) === `string` && !Component.styleCache.has(this.constructor)) {
			Component.styleCache.set(this.constructor, this.style);

			if (appContext === `browser`) {
				const $style = document.createElement(`style`);
				$style.textContent = this.style;
				document.head.appendChild($style);
			}
		}

		if (appContext !== `browser`) {
			return rendered;
		}
		if (rendered instanceof Promise) {
			return rendered.then(html => Component.wrap(this, html)) as ReturnType<this[`template`]>;
		}
		return Component.wrap(this, rendered) as ReturnType<this[`template`]>;
	}

	// TODO2: rerender

	abstract template(...args: Array<any> | []): string | Promise<string>; // eslint-disable-line @typescript-eslint/no-explicit-any
}
