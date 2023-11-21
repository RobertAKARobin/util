import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import { appContext } from './context.ts';
import { Component } from './component.ts';
import { Page } from './page.ts';

export const isAbsoluteUrl = /^\w+\:\/\//;
export const hasExtension = /\.\w+$/;
export const hasHash = /#.*$/;

export type RouteMap = Record<string, string>;

export type ResolverFunction<Routes extends RouteMap> = (
	path: Routes[keyof Routes],
	routes: Routes,
) => Page | undefined | Promise<Page | undefined>;

/**
 * Listens for URL/location changes and updates `.path` accordingly
 */
export class Router<
	Routes extends RouteMap
> {
	/**
	 * A map of each route name to the URL hash in its path (if any)
	 */
	readonly hashes = {} as Record<keyof Routes, string | undefined>;
	readonly path = new Emitter<Routes[keyof Routes]>();

	constructor(
		readonly routes: Routes
	) {
		for (const key in this.routes) {
			const routeName: keyof Routes = key;
			let path = this.routes[routeName] as string;
			let hash: string | undefined;
			path = path.replace(hasHash, match => {
				hash = match;
				return ``;
			});
			if (!path.endsWith(`/`) && !hasExtension.test(path)) {
				path = `${path}/`;
			}
			if (hash !== undefined) {
				path = `${path}${hash}`;
			}
			this.routes[routeName] = path as Routes[keyof Routes];
		}

		for (const routeName in routes) {
			const routePath = routes[routeName];
			const hashPosition = routePath.indexOf(`#`);
			this.hashes[routeName] = hashPosition >= 0
				? routePath.substring(hashPosition + 1)
				: undefined;
		}

		if (appContext === `browser`) {
			window.onpopstate = () => {
				const newPath = window.location.pathname;
				if (newPath !== this.path.last) {
					this.path.next(newPath as Routes[keyof Routes]);
				}
			};

			this.path.next(window.location.pathname as Routes[keyof Routes]);
		}
	}
}

/**
 * Updates `Page.current` whenever `router.path` changes.
 */
export class Resolver<Routes extends RouteMap> {
	private routeCount = -1;
	constructor(
		readonly router: Router<Routes>,
		readonly resolveFunction: (
			path: Routes[keyof Routes],
			routes: Routes,
		) => Page | undefined | Promise<Page | undefined>,
	) {

		this.router.path.subscribe(async path => {
			// TODO1: If newPath is same as oldPath, esp without hash
			this.routeCount += 1;
			const page = await this.resolve(path);
			if (page) {
				Page.current.next(page);
			}
		});
	}

	/**
	 * When `Page.current` changes, attach it to the provided HTML element and render it
	 */
	bindTo($input: HTMLElement) {
		const $outlet = typeof $input === undefined ? document.body : $input;

		Page.current.subscribe(page => {
			page.$el = $outlet;

			if (this.routeCount > 0) {
				document.title = page.title;
				page.rerender();
			}
		});
	}

	/**
	 * Convert a Router path to a Page
	 */
	async resolve(path: Routes[keyof Routes]) {
		return await this.resolveFunction(path, this.router.routes);
	}
}

/**
 * Use in place of `<a>` to link to a different path/page
 */
export abstract class RouteComponent<
	Routes extends RouteMap
> extends Component {
	abstract readonly router: Router<Routes>;

	constructor(
		public routeName: keyof Routes,
		public content?: string,
		...args: ConstructorParameters<typeof Component>
	) {
		super(...args);
	}

	onClick(
		event: MouseEvent,
		path: Routes[keyof Routes],
	) {
		if (event.metaKey || event.ctrlKey) { // Allow opening in new tab
			return;
		}

		event.preventDefault();
		window.history.pushState({}, ``, path);
		this.router.path.next(path);
	}

	template = () => {
		const url = this.router.routes[this.routeName];
		const isAbsolute = isAbsoluteUrl.test(url);
		return `<a href="${url}" onclick=${this.bind(`onClick`, url)} target="${isAbsolute ? `_blank` : `_self`}" ${this.attrs()}>${this.content ?? ``}</a>`;
	};
}

/**
 * Creates a RouteComponent that uses the provided Router
 */
export function routeComponent<Routes extends RouteMap>(
	router: Router<Routes>
) {
	class AppRouteComponent extends RouteComponent<Routes> {
		router = router;
	}
	return Component.register(AppRouteComponent);
}
