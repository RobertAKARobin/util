/**
 * @import { EmitterOptions } from '../emitter/types.d';
 * @import { Params } from '../types.d';
 */

import { baseUrl } from './context.js';
import { Emitter } from '../emitter/emitter.js';
import { proxyDeep } from '../proxyDeep.js';

/**
 * @typedef {(...args: Array<any>) => URL | string} RoutePathFunction
 * @typedef {RoutePathFunction | URL | string} RouteMaybe
 * @typedef {Record<string, RoutePathFunction>} RouteMap
 * @typedef {Extract<keyof WindowEventHandlersEventMap, 'hashchange' | 'popstate'> | 'navigate'} RouterEventType
 */

/**
 * @template {RouteMap} Routes
 * @typedef {{routeName: keyof Routes; type: RouterEventType; url: URL}} RouterEvent
 */

/**
 * Given a dictionary of routes, e.g. { contactPage: `/contact` }, listens to window location changes and emits the new location
 * @template {RouteMap} Routes
 * @augments {Emitter<RouterEvent<Routes>>}
 */
export class Router extends Emitter {
	static hasExtension = /\.\w+(\?.*|$)/;
	static paramDelimeter = `[()]`;

	/**
	 * Given a route and a map of routes, find the route name that matches the given route
	 * @param {RouteMaybe} route
	 * @param {RouteMap} routes
	 * @returns {string | undefined}
	 */
	static findRouteName(route, routes) {
		if (typeof route === `string` && route in routes) {
			return route;
		}

		for (const routeName in routes) {
			const subject = routes[routeName];
			if (Router.match(route, subject) !== null) {
				return routeName;
			}
		}

		return undefined;
	}

	/**
	 * Returns whether a possible route path matches a known route
	 * @param {RouteMaybe} subject
	 * @param {RouteMaybe} control
	 * @returns {boolean}
	 */
	static isMatch(subject, control) {
		return (Router.match(subject, control) !== null);
	}

	/**
	 * See {@link Router.prototype.match}
	 * @param {RouteMaybe} subject
	 * @param {RouteMaybe} control
	 * @returns {Array<string> | null}
	 */
	static match(subject, control) {
		if (subject === control) {
			return [];
		}

		if (typeof subject === `function`) {
			return null;
		}

		const subjectUrl = decodeURI(Router.toPath(subject));
		const controlUrl = decodeURI(Router.toPath(control));

		if (typeof control === `function`) {
			const matcher = new RegExp(
				controlUrl
					.replace(/[.?]/g, `\\$&`)
					.replaceAll(Router.paramDelimeter, `([\\w ]+)`)
					+ `$`,
			);
			const match = subjectUrl.match(matcher);
			if (match === null) {
				return null;
			}
			return match.slice(1);
		}

		if (subjectUrl !== controlUrl) {
			return null;
		}

		return [];
	}

	/**
	 * Converts a route to a file path
	 * @param {RouteMaybe} input
	 * @returns {string}
	 */
	static toPath(input) {
		const url = Router.toUrl(input);
		let path = `${url.origin}${url.pathname}`;

		if (Router.hasExtension.test(path) === false && path.endsWith(`/`)) {
			path = path.slice(0, -1);
		}

		return path;
	}

	/**
	 * Converts a route to a URL
	 * @param {RouteMaybe} input
	 * @returns {URL}
	 */
	static toUrl(input) {
		if (input instanceof URL) {
			return input;
		}

		if (typeof input === `string`) {
			return new URL(input, baseUrl);
		}

		return new URL(input(proxyDeep(Router.paramDelimeter)), baseUrl);
	}

	/**
	 * @type {Set<keyof Routes>}
	 * @readonly
	 */
	routeNames;

	/**
	 * @type {Routes}
	 * @readonly
	 */
	routes;

	/**
	 * @param {Routes} routes
	 * @param {EmitterOptions<RouterEvent<Routes>>} options
	 */
	constructor(
		routes,
		options = {},
	) {
		const landingUrl = globalThis.location !== undefined
			? new URL(globalThis.location.href)
			: undefined;

		super(
			landingUrl === undefined ? undefined : /** @type {RouterEvent<Routes>} */({
				routeName: Router.findRouteName(landingUrl, routes),
				type: `navigate`,
				url: landingUrl,
			}),
			options,
		);

		this.routes = routes;
		this.routeNames = new Set(Object.keys(routes));
	}

	/**
	 * Given a route, find its name in this Router's route map.
	 * See {@link Router.findRouteName}
	 * @param {RouteMaybe} route
	 * @returns {keyof Routes | undefined}
	 */
	findRouteName(route) {
		return Router.findRouteName(route, this.routes);
	}

	/**
	 * Sets the router's state to the url of the specified route name
	 * @template {keyof Routes} RouteName
	 * @template {Routes[RouteName]} Route
	 * @param {RouteName} target
	 * @param {Params<Route>} args
	 * @returns {this}
	 */
	go(target, ...args) {
		const routeName = this.findRouteName(String(target));

		if (routeName === undefined) {
			throw new Error(`Route with name '${routeName}' is not defined`);
		}

		const route = this.routes[routeName];

		const path = route.apply(null, args);

		const url = path instanceof URL
			? path
			: new URL(path, baseUrl);

		return this.set({
			routeName,
			type: `navigate`,
			url,
		});
	}

	/**
	 * TODO1 Move this out so Router can be platform independent?
	 * Sets up the router to listen for location changes and intercept click events that cause navigation
	 * @returns {void}
	 */
	init() {
		globalThis.onhashchange = globalThis.onpopstate = () => { // Popstate is fired only by performing a browser action on the current document, e.g. back, forward, or hashchange. Hashchange is fired _after_ popstate
			const url = new URL(globalThis.location.href);
			this.set({
				routeName: /** @type {keyof Routes} */(this.findRouteName(url)),
				type: `popstate`,
				url,
			});
		};

		document.addEventListener(`click`, event => {
			const $target = /** @type {HTMLElement} */(event.target);
			const $link = $target.closest(`a`);

			if ($link === null) {
				return;
			}

			const href = $link.getAttribute(`href`);

			if (href === null) {
				return;
			}

			if (event.metaKey || event.ctrlKey) { // Allow opening in new tab
				return;
			}

			const target = $link.getAttribute(`target`); // Specifying a [target] causes a normal page load/refresh
			if (target !== null) {
				return;
			}

			const url = new URL(href, baseUrl);
			if (url.origin !== baseUrl.origin) { // External URLs
				return;
			}

			event.preventDefault();

			this.set({
				routeName: /** @type {keyof Routes} */(this.findRouteName(url)),
				type: `navigate`,
				url,
			});
		});
	}

	/**
	 * Returns the portions of a path that match the variables in a known route path
	 * @param {RouteMaybe} subject
	 * @returns {Array<string> | null}
	 */
	match(subject) {
		const routeName = this.findRouteName(subject); // TODO3: This runs Router.match twice under the hood
		if (routeName === undefined) {
			return null;
		}

		return Router.match(subject, this.routes[routeName]);
	}
}

/**
 * Given a route, returns the corresponding View
 */
export class Resolver<
	View,
	Routes extends RouteMap = any, // eslint-disable-line @typescript-eslint/no-explicit-any
	AppRouter extends Router<Routes> = Router<Routes>,
> extends Emitter<View> {
	constructor(
		readonly router: AppRouter,
		readonly resolve: (to: URL, from?: URL) => Promise<View> | View,
	) {
		super();

		router.subscribe((...args) => void this.onPage(...args));
	}

	async onPage<PageEvent extends RouterEvent<Routes>>(
		event: PageEvent,
		{ previous }: { previous: PageEvent; },
	) {
		const to = event.url;
		const from = previous?.url;

		if (to.href === from?.href) { // On no change
			return;
		}

		if (to.origin !== baseUrl.origin && to.origin !== defaultBaseUrl.origin) { // On external
			location.href = to.href;
			return;
		}

		if (to.pathname !== from?.pathname) { // On new page
			if (from !== undefined && event.type === `navigate`) {
				globalThis.history.pushState({}, ``, `${to.pathname}${to.search}`);
			}

			this.set(await this.resolve(to, from));

			if (to.hash.length > 0) {
				location.hash = to.hash;
			}

			return;
		}

		if (to.hash !== from?.hash) { // On same page with new hash
			location.hash = to.hash;
			if (to.hash?.length === 0) {
				globalThis.history.replaceState({}, ``, to.pathname); // Turns out `location.hash = ''` will still set a hash of `#`. So, if going from a path with hash to path without hash, we'll need to handle the hash differently
			}
		}
	}
}
