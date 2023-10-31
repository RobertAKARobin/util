import { Emitter } from '@robertakarobin/emit/index.ts';

import type * as Type from './types.d.ts';

export const routerContexts = [
	`client`,
	`static`,
] as const;

export const routerContext: Type.RouterContext = typeof window !== `undefined`
	? `client`
	: `static`;

class Router__Client extends Emitter<string> {
	constructor() {
		super({
			cache: {
				limit: 1,
			},
		});

		window.onpopstate = window.onload = this.onChange.bind(this);
	}

	onChange() {
		const newPath = window.location.pathname;
		if (newPath !== this.last) {
			this.next(newPath);
		}
	}
}

class Router__Static extends Emitter<string> {}

export const router = routerContext === `client`
	? new Router__Client()
	: new Router__Static();
