import { Emitter } from '@robertakarobin/emit/index.ts';

export class Renderer {
	constructor(
		private readonly $container: HTMLElement
	) {}

	render = (page: string) => {
		this.$container.innerHTML = page;
	};
}

export class Router extends Emitter<string> {
	constructor(
		readonly route: (path: string) => string
	) {
		super();
	}
}
