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
		super();

		if (routerContext === `browser`) {
			window.onpopstate = this.onChange.bind(this);
		}
	}

	onChange() {
		const newPath = window.location.pathname;
		if (newPath !== this.last) {
			this.next(newPath);
		}
	}
}

export const matchExtension = /\.\w+$/;
export const normalizeRoutes = <
	Routes extends Type.Routes = Type.Routes
>(input: Routes): Routes => {
	const output = {} as Type.Routes;
	for (const key in input) {
		const route = input[key];
		if (typeof route === `object`) {
			output[key] = normalizeRoutes(route);
		} else if (typeof route === `string`) {
			let path: string = route;
			if (!path.endsWith(`/`) && !matchExtension.test(path)) {
				path = `${path}/`;
			}
			output[key] = path;
		}
	}
	return output as Routes;
};

export const router = new Router__Browser();
