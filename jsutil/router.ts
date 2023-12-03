import { appContext, baseHref } from './context.ts';
import { Emitter } from './emitter.ts';

export class Route extends URL {
	readonly idAttr: string;
	readonly isExternal: boolean;
	constructor(...args: ConstructorParameters<typeof URL>) {
		super(...args);
		this.isExternal = this.origin !== baseHref.origin;
		this.idAttr = this.hash.substring(1);
	}
};

export type RouteMap = Record<string, string>;

export type Routes<RouteMap_ extends RouteMap = never> = Record<keyof RouteMap_, Route>;

export function buildRoutes<RouteMap_ extends RouteMap>(
	routes: RouteMap_
): Routes<RouteMap_> {
	const output = {} as Record<keyof RouteMap_, Route>;
	for (const key in routes) {
		const routeName: keyof RouteMap_ = key;
		let routePath = routes[routeName] as string;
		routePath = routePath.startsWith(`/`) ? routePath.substring(1) : routePath;
		const route: Route = new Route(baseHref.href + routePath);
		output[routeName] = route;
	}
	return output;
}

export class Router<
	Routes_ extends Routes,
	View,
> {
	readonly route = new Emitter<Route>();

	constructor(
		readonly routes: Routes_,
		readonly resolve: (route: Route, routes: Routes_) => View | Promise<View>,
	) {
		this.route.subscribe((to, from) => {
			void this.onNav({ from, to });
		}, { strong: true });

		if (appContext === `browser`) {
			window.onpopstate = () => { // Popstate is fired only by performing a browser action on the current document, e.g. back, forward, or hashchange
				const newRoute = new Route(window.location.href);
				this.route.next(newRoute);
			};

			window.onhashchange = () => { // Hashchange is fired _after_ popstate
				const newRoute = new Route(window.location.href);
				this.route.next(newRoute);
			};
		}
	}

	private async onNav(nav: { from?: Route; to: Route; }) {
		if (nav.to.pathname !== nav.from?.pathname) { // On new page
			const view = await this.resolve(nav.to, this.routes);
			await this.render(view, nav.to);
			window.history.pushState({}, ``, this.route.last.pathname); // Setting the hash here causes the jumpanchor to not be activated for some reason
			if (this.route.last.hash.length > 0) {
				location.hash = this.route.last.hash;
			}
			return;
		}

		if (nav.to.href === nav.from?.href) { // On no change
			return;
		}

		if (nav.to.origin !== nav.from?.origin) { // On external
			location.href = nav.to.href;
			return;
		}

		if (nav.to.hash !== nav.from?.hash) { // On same page with new hash
			location.hash = nav.to.hash;
			if (this.route.last.hash.length === 0) {
				window.history.replaceState({}, ``, this.route.last.pathname); // Turns out `location.hash = ''` will still set a hash of `#`. So, if going from a path with hash to path without hash, we'll need to handle the hash differently
			}
		}
	}

	render: (view: View, route: Route) => void | Promise<void> = () => undefined;

	to(routeName: keyof Routes_) {
		const route = this.routes[routeName];
		this.route.next(route);
	}
}
