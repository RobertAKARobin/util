import { baseUrl, defaultBaseUrl } from './context.ts';
import { Emitter } from './emitter.ts';
import { toAttributes } from './attributes.ts';

export const hasExtension = /\.\w+$/;

export type RouteMap = Record<string, string>;

/**
 * Given a dictionary of routes, e.g. { contactPage: `/contact` }, listens to window location changes and emits the new location
 */
export class Router<Routes extends RouteMap = Record<string, never>> extends Emitter<URL> {
	readonly baseUrl: URL;
	readonly hashes = {} as Record<keyof Routes, string>;
	readonly paths = {} as Record<keyof Routes, string>;
	readonly routeNames = [] as Array<keyof Routes>;
	readonly urls = {} as Record<keyof Routes, URL>;

	constructor(routes: Routes, options: Partial<{
		baseUrl: string | URL;
	}> = {}) {
		super(globalThis.location !== undefined
			? new URL(globalThis.location.href)
			: undefined
		);

		this.baseUrl = new URL(options.baseUrl ?? baseUrl);

		for (const key in routes) {
			const path = routes[key] as string;
			this.add(key, path);
		}
	}

	/**
	 * Defines a new route
	 */
	add(routeName: keyof Routes, path: string) {
		this.routeNames.push(routeName);

		const url = new URL(path, this.baseUrl);
		this.urls[routeName] = url;
		this.hashes[routeName] = url.hash.substring(1);

		const isExternal = url.origin !== this.baseUrl.origin;

		if (isExternal) {
			this.paths[routeName] = url.href;
		} else {
			if (!hasExtension.test(url.pathname)) {
				if (!url.pathname.endsWith(`/`)) {
					url.pathname += `/`;
				}
			}
			this.paths[routeName] = `${url.pathname}${url.hash}`;
		}
	}

	/**
	 * Sets up the router to listen for location changes and intercept click events that cause navigation
	 */
	init() {
		window.onpopstate = () => { // Popstate is fired only by performing a browser action on the current document, e.g. back, forward, or hashchange
			this.set(new URL(window.location.href));
		};

		window.onhashchange = () => { // Hashchange is fired _after_ popstate
			this.set(new URL(window.location.href));
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

			const url = new URL(href, baseUrl);
			if (url.origin !== baseUrl.origin) { // External URLs
				return;
			}

			event.preventDefault();

			this.set(href);
		});
	}

	/**
	 * Returns the HTML for an anchor <a> element to the specified route
	 */
	link(
		routeName: keyof Routes,
		content: string = ``,
		attributeOverrides: Record<string, string> = {},
	) {
		const url = this.urls[routeName];
		const isExternal = url.origin !== this.baseUrl.origin;
		const attributes = isExternal
			? {
				href: url,
				rel: `noopener`,
				target: `_blank`,
				...attributeOverrides,
			}
			: {
				href: this.paths[routeName],
				...attributeOverrides,
			};
		return `<a ${toAttributes(attributes)}>${content}</a>`;
	}

	/**
	 * Updates the window's location to the specified URL
	 */
	set(update: string | Partial<URL>): this {
		let url: URL;
		if (typeof update === `string`) {
			url = new URL(update, this.baseUrl);
		} else {
			url = update as URL;
		}
		return super.set(url);
	}

	/**
	 * Updates the window's location to the url of the specified route name
	 */
	to(routeName: keyof Routes) {
		return this.set(this.urls[routeName]);
	}
}

/**
 * Given a route, returns the corresponding View
 */
export class Resolver<View> extends Emitter<View> {
	constructor(
		readonly router: Router<never>,
		readonly resolve: (to: URL, from?: URL) => View | Promise<View>,
	) {
		super();

		router.subscribe(async(to, { previous }) => {
			if (to.href === previous?.href) { // On no change
				return;
			}

			if (to.pathname !== previous?.pathname) { // On new page
				this.set(await this.resolve(to, previous));

				if (previous !== undefined) {
					window.history.pushState({}, ``, to.pathname); // Setting the hash here causes the jumpanchor to not be activated for some reason, so we do it on the next line
					if (to.hash.length > 0) {
						location.hash = to.hash;
					}
				}

				return;
			}

			if (to.origin !== baseUrl.origin && to.origin !== defaultBaseUrl.origin) { // On external
				location.href = to.href;
				return;
			}

			if (to.hash !== previous?.hash) { // On same page with new hash
				location.hash = to.hash;
				if (to.hash?.length === 0) {
					window.history.replaceState({}, ``, to.pathname); // Turns out `location.hash = ''` will still set a hash of `#`. So, if going from a path with hash to path without hash, we'll need to handle the hash differently
				}
			}
		});
	}
}
