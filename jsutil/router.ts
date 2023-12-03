import { appContext, baseHref } from './context.ts';
import { Emitter } from './emitter.ts';

export class Route extends URL {
	readonly idAttr: string;
	readonly isExternal: boolean;
	constructor(...[input]: ConstructorParameters<typeof URL>) {
		const url = input instanceof URL
			? input
			: input.startsWith(`/`)
				? input.substring(1)
				: input;
		super(url, baseHref);
		this.isExternal = this.origin !== baseHref.origin;
		this.idAttr = this.hash.substring(1);
	}
};

export type RouteMap = Record<string, string>;

export class Router<RouteMap_ extends RouteMap = any> extends Emitter<Route> { // eslint-disable-line @typescript-eslint/no-explicit-any
	readonly routes = {} as Record<keyof RouteMap_, Route>;

	constructor(routes: RouteMap_) {
		super();

		for (const key in routes) {
			this.routes[key] = new Route(routes[key]);
		}

		if (appContext === `browser`) {
			window.onpopstate = () => { // Popstate is fired only by performing a browser action on the current document, e.g. back, forward, or hashchange
				const newRoute = new Route(window.location.href);
				this.next(newRoute);
			};

			window.onhashchange = () => { // Hashchange is fired _after_ popstate
				const newRoute = new Route(window.location.href);
				this.next(newRoute);
			};
		}
	}
}

export class Resolver<View> extends Emitter<View> {
	constructor(
		readonly router: Router<never>,
		readonly resolve: (to: Route, from?: Route) => Promise<View>,
	) {
		super();

		router.subscribe(async(to, from) => {
			if (to.pathname !== from?.pathname) { // On new page
				this.next(await this.resolve(to, from));
				return;
			}

			if (to.href === from?.href) { // On no change
				return;
			}

			if (to.origin !== from?.origin) { // On external
				location.href = to.href;
				return;
			}

			if (to.hash !== from?.hash) { // On same page with new hash
				location.hash = to.hash;
				if (to.hash.length === 0) {
					window.history.replaceState({}, ``, to.pathname); // Turns out `location.hash = ''` will still set a hash of `#`. So, if going from a path with hash to path without hash, we'll need to handle the hash differently
				}
			}
		}, { strong: true });
	}
}

export class Renderer<View> extends Emitter<void> {
	constructor(
		readonly resolver: Resolver<View>,
		readonly render: (
			newView: View,
			oldView: View,
			newRoute: Route,
		) => void | Promise<void>
	) {
		super();

		const landingRoute = new Route(location.href);
		resolver.resolve(landingRoute)
			.then(view => {
				void this.render(view, undefined as View, landingRoute);
			})
			.catch(console.error);

		resolver.subscribe(async(newView, oldView) => {
			const to = this.resolver.router.last;
			await this.render(newView, oldView, this.resolver.router.last);
			window.history.pushState({}, ``, to.pathname); // Setting the hash here causes the jumpanchor to not be activated for some reason
			if (to.hash.length > 0) {
				location.hash = to.hash;
			}
		}, { strong: true });
	}
}
