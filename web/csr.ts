import { Emitter } from '@robertakarobin/emit/index.ts';

import { Component } from './component.ts';

export class Renderer {
	constructor(
		private readonly $container: HTMLElement
	) {}

	render = (page: Component) => {
		if (page.template) {
			this.$container.innerHTML = page.template();
		}

		if (page.style && page.styleId) {
			if (!document.getElementById(page.styleId)) {
				const $style = document.createElement(`style`);
				$style.setAttribute(`id`, page.styleId);
				$style.textContent = page.style;
				document.head.appendChild($style);
			}
		}
	};
}

export class Router extends Emitter<Component> {
	constructor(
		readonly route: (path: string) => Component
	) {
		super();
	}
}
