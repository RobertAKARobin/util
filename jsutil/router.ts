import { appContext, baseHref, defaultBaseUrl } from './context.ts';
import { Emitter } from './emitter.ts';

export class Route extends URL {
	readonly idAttr: string;
	readonly isExternal: boolean;
	constructor(...[input]: ConstructorParameters<typeof URL>) {
		const url = (input instanceof URL)
			? input.href
			: input.startsWith(`/`)
				? input.substring(1)
				: input;
		super(url, baseHref);
		this.isExternal = this.origin !== baseHref.origin;
		this.idAttr = this.hash.substring(1);
	}
};

export type RouteMap = Record<string, string>;

export class Router<RouteMap_ extends RouteMap = any> extends Emitter<{ route: Route; }> { // eslint-disable-line @typescript-eslint/no-explicit-any
	readonly routes = {} as Record<keyof RouteMap_, Route>;

	constructor(routes: RouteMap_) {
		super();

		for (const key in routes) {
			this.routes[key] = new Route(routes[key]);
		}

		if (appContext === `browser`) {
			window.onpopstate = () => { // Popstate is fired only by performing a browser action on the current document, e.g. back, forward, or hashchange
				this.set({ route: new Route(window.location.href) });
			};

			window.onhashchange = () => { // Hashchange is fired _after_ popstate
				this.set({ route: new Route(window.location.href) });
			};
		}
	}

	to(route: Route) {
		this.set({ route });
	}
}

export class Resolver<View> extends Emitter<{ view: View; }> {
	constructor(
		readonly router: Router<never>,
		readonly resolve: (to: Route, from?: Route) => Promise<View>,
	) {
		super();

		router.subscribe(async(to, { previous }) => {
			if (to.route.href === previous?.route.href) { // On no change
				return;
			}

			if (to.route.pathname !== previous?.route.pathname) { // On new page
				this.set({ view: await this.resolve(to.route, previous?.route) });
				return;
			}

			if (to.route.origin !== baseHref.origin && to.route.origin !== defaultBaseUrl.origin) { // On external
				location.href = to.route.href;
				return;
			}

			if (to.route.hash !== previous?.route.hash) { // On same page with new hash
				location.hash = to.route.hash;
				if (to.route.hash?.length === 0) {
					window.history.replaceState({}, ``, to.route.pathname); // Turns out `location.hash = ''` will still set a hash of `#`. So, if going from a path with hash to path without hash, we'll need to handle the hash differently
				}
			}
		}, { isStrong: true });
	}
}

export class Renderer<View> extends Emitter<{ view: View; }> {
	constructor(
		readonly resolver: Resolver<View>,
		readonly render: (
			newView: View,
			oldView: View,
			newRoute: Route,
		) => void | Promise<void>
	) {
		super();

		resolver.subscribe(async({ view }, { previous }) => {
			const to = this.resolver.router.value;
			await this.render(view, previous?.view, to?.route);
			if (previous !== undefined) {
				window.history.pushState({}, ``, to.route.pathname); // Setting the hash here causes the jumpanchor to not be activated for some reason
				if (to.route.hash.length > 0) {
					location.hash = to.route.hash;
				}
			}
		}, { isStrong: true });

		const landingRoute = new Route(location.href);
		resolver.resolve(landingRoute)
			.then(view => this.resolver.set({ view }))
			.catch(console.error);
	}
}
