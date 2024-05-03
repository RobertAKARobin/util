import { appContext, baseUrl, defaultBaseUrl } from './context.ts';
import { Emitter, type EmitterOptions } from './emitter/emitter.ts';
import { proxyDeep } from './proxyDeep.ts';

export type RoutePathFunction = (...args: Array<any>) => URL | string; // eslint-disable-line @typescript-eslint/no-explicit-any

export type RouteDefinition = RoutePathFunction | URL | string;

export type RouteMap = Record<string, RouteDefinition>;

export type RouterEventType = Extract<keyof WindowEventHandlersEventMap, `hashchange` | `popstate`> | `navigate`;

export type RouterEvent<Routes extends RouteMap> = {
	routeName: keyof Routes | undefined;
	type: RouterEventType;
	url: URL;
};

/**
 * Given a dictionary of routes, e.g. { contactPage: `/contact` }, listens to window location changes and emits the new location
 */
export class Router<Routes extends RouteMap> extends Emitter<RouterEvent<Routes>> {
	static hasExtension = /\.\w+(\?.*|$)/;
	static paramDelimeter = `[()]`;

	static findRouteName(route: RouteDefinition, routes: RouteMap) {
		for (const routeName in routes) {
			const subject = routes[routeName];
			if (Router.match(route, subject) !== null) {
				return routeName;
			}
		}
	}

	static isMatch(...args: Parameters<typeof Router.match>) {
		return (Router.match(...args) !== null);
	}

	static match(subject: RouteDefinition, control: RouteDefinition) {
		if (subject === control) {
			return [];
		}

		if (typeof subject === `function`) {
			return null;
		}

		const subjectUrl = decodeURI(Router.toLine(subject));
		const controlUrl = decodeURI(Router.toLine(control));

		if (typeof control === `function`) {
			const matcher = new RegExp(
				controlUrl
					.replace(/[.?]/g, `\\$&`)
					.replaceAll(Router.paramDelimeter, `([\\w ]+)`)
					+ `$`
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

	static toLine(input: RouteDefinition) {
		const url = Router.toUrl(input);
		let path = `${url.origin}${url.pathname}`;

		if (!Router.hasExtension.test(path) && path.endsWith(`/`)) {
			path = path.slice(0, -1);
		}

		return path;

	}

	static toUrl(input: RouteDefinition) {
		if (input instanceof URL) {
			return input;
		}

		if (typeof input === `string`) {
			return new URL(input, baseUrl);
		}

		return new URL(input(proxyDeep(Router.paramDelimeter)), baseUrl);
	}

	readonly routeNames: Set<keyof Routes>;
	readonly routes: Routes;

	constructor(routes: Routes, options: Partial<EmitterOptions<RouterEvent<Routes>>> = {}) {
		const landingUrl = globalThis.location !== undefined
			? new URL(globalThis.location.href)
			: undefined;

		super(
			landingUrl === undefined ? undefined : {
				routeName: Router.findRouteName(landingUrl, routes),
				type: `navigate`,
				url: landingUrl,
			},
			options,
		);

		this.routes = routes;
		this.routeNames = new Set(Object.keys(routes));
	}

	findRouteName(route: RouteDefinition): keyof Routes | undefined {
		return Router.findRouteName(route, this.routes);
	}

	/**
	 * Updates the window's location to the url of the specified route name
	 */
	go(
		update: RouteDefinition | keyof Routes,
		...args: typeof update extends keyof Routes
			? (
				Routes[typeof update] extends RoutePathFunction
					? Parameters<Routes[typeof update]>
					: []
			) : []
	) {
		const routeName: keyof Routes | undefined = (update as keyof Routes) in this.routes
			? update as keyof Routes
			: this.findRouteName(update as RouteDefinition);

		const route = routeName === undefined
			? update as RouteDefinition
			: this.routes[routeName];

		const path: URL | string = route instanceof Function
			?	route(...args)
			: route;

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
	 * Sets up the router to listen for location changes and intercept click events that cause navigation
	 */
	init() {
		globalThis.onhashchange = globalThis.onpopstate = () => { // Popstate is fired only by performing a browser action on the current document, e.g. back, forward, or hashchange. Hashchange is fired _after_ popstate
			const url = new URL(globalThis.location.href);
			this.set({
				routeName: this.findRouteName(url),
				type: `popstate`,
				url,
			});
		};

		document.addEventListener(`click`, event => {
			const $target = event.target as HTMLElement;
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
				routeName: this.findRouteName(url),
				type: `navigate`,
				url,
			});
		});
	}

	match(subject: RouteDefinition) {
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
		readonly router: AppRouter, // eslint-disable-line @typescript-eslint/no-explicit-any
		readonly resolve: (to: URL, from?: URL) => Promise<View> | View,
	) {
		super();

		router.subscribe((...args) => void this.onPage(...args));
	}

	async onPage<PageEvent extends RouterEvent<Routes>>(
		event: PageEvent,
		{ previous }: { previous: PageEvent; }
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
			if (from !== undefined && appContext === `browser` && event.type === `navigate`) {
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
