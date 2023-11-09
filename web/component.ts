import type * as $ from '@robertakarobin/jsutil';

import { routerContext } from './router.ts';

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
	private static styleCache = new Map< // This is a Map instead of a WeakMap because we don't want <style> elements to be garbage collected; once a style is applied to a page it is permanent
		typeof Component.constructor,
		HTMLStyleElement
	>();

	static {
		if (routerContext === `browser`) {
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
			$anchor.remove();

			component.$root = $root;
			$root.setAttribute(Component.htmlAttribute, component.uid);
			Component.instanceCache.set($root, component);
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
		if (routerContext !== `browser`) {
			return `""`;
		}
		const argsString = args.map(arg => `'${arg}'`).join(``);
		return `"Component.cached('${this.uid}', this).${methodName as string}(event, ${argsString})"`;
	}

	render(
		...args: Parameters<this[`template`]>
	): ReturnType<this[`template`]> {
		const rendered = this.template(...args) as ReturnType<this[`template`]>;
		if (routerContext !== `browser`) {
			return rendered;
		}

		if (this.style && !Component.styleCache.has(this.constructor)) {
			const $style = document.createElement(`style`);
			$style.textContent = this.style;
			document.head.appendChild($style);
			Component.styleCache.set(this.constructor, $style);
		}

		if (rendered instanceof Promise) {
			return rendered.then(html => Component.wrap(this, html)) as ReturnType<this[`template`]>;
		}
		return Component.wrap(this, rendered) as ReturnType<this[`template`]>;
	}

	// TODO2: rerender

	abstract template(...args: Array<any> | []): string | Promise<string>; // eslint-disable-line @typescript-eslint/no-explicit-any
}
