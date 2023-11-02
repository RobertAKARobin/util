import { Emitter } from '@robertakarobin/emit/index.ts';

import type * as Type from './types.d.ts';

export const routerContexts = [
	`browser`,
	`build`,
] as const;

export const routerContext: Type.RouterContext = typeof window !== `undefined`
	? `browser`
	: `build`;

class Router__Browser extends Emitter<string> { // Naming it this way in case we need different types of routers later on
	constructor() {
		super({
			cache: {
				limit: 1,
			},
		});

		if (routerContext === `browser`) {
			window.onpopstate = window.onload = this.onChange.bind(this);
		}
	}

	onChange() {
		const newPath = window.location.pathname;
		if (newPath !== this.last) {
			this.next(newPath);
		}
	}
}

export const router = new Router__Browser();

export const layout = new Emitter<Type.PageLayout>();

export const title = new Emitter<string>();
