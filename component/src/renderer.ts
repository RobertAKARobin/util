import { Component } from 'component/src/component.ts';

export class AsyncRenderer {
	constructor(
		private readonly $container: HTMLElement
	) {}

	render = (page: Component) => {
		if (page.template) {
			this.$container.innerHTML = page.template();
		}

		if (page.style) {
			if (!document.getElementById(page.styleId)) {
				const $style = document.createElement(`style`);
				$style.textContent = page.style;
				document.head.appendChild($style);
			}
		}
	};
}
