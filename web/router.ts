import { appContext, baseUrl, defaultBaseUrl } from '@robertakarobin/util/context.ts';
import { Emitter } from '@robertakarobin/util/emitter.ts';
import { Page } from './component.ts';

export const hasExtension = /\.\w+$/;

export type RouteMap = Record<string, string>;

/**
 * Given a dictionary of routes, e.g. { contactPage: `/contact` }, listens to window location changes and emits the new location
 */
export class Router<RouteMap_ extends RouteMap = Record<string, never>> extends Emitter<URL> {
	readonly hashes = {} as Record<keyof RouteMap_, string>;
	readonly paths = {} as Record<keyof RouteMap_, string>;
	readonly routeNames: Array<keyof RouteMap_> = [];
	readonly urls = {} as Record<keyof RouteMap_, URL>;

	constructor(routes: RouteMap_) {
		super();

		for (const key in routes) {
			this.routeNames.push(key);

			const path = routes[key] as string;

			const url = new URL(path, baseUrl);
			this.urls[key] = url;

			this.hashes[key] = url.hash.substring(1);
			if (!hasExtension.test(url.pathname)) {
				if (!url.pathname.endsWith(`/`)) {
					url.pathname += `/`;
				}
			}

			if (url.origin === baseUrl.origin) {
				this.paths[key] = `${url.pathname}${url.hash}`;
			} else {
				this.paths[key] = url.href;
			}
		}

		if (appContext === `browser`) {
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
	}

	/**
	 * Updates the window's location
	 */
	set(update: string | Partial<URL>): this {
		let url: URL;
		if (typeof update === `string`) {
			url = new URL(update, baseUrl);
		} else {
			url = update as URL;
		}
		return super.set(url);
	}

	to(routeName: keyof RouteMap_) {
		return this.set(this.urls[routeName]);
	}
}

/**
 * Given a route, returns the corresponding Page
 */
export class Resolver<CurrentPage extends Page> extends Emitter<CurrentPage> {

	constructor(
		readonly router: Router<never>,
		readonly resolve: (to: URL, from?: URL) => CurrentPage | Promise<CurrentPage>,
	) {
		const $landingPage = document.querySelector(`[${Page.$pageAttr}]`) as CurrentPage;
		super($landingPage);

		router.subscribe(async(to, { previous }) => {
			if (to.href === previous?.href) { // On no change
				return;
			}

			if (to.pathname !== previous?.pathname) { // On new page
				this.set(await this.resolve(to, previous));
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

/**
 * Given a Page, figures out what to do with it (e.g. render it after the document's `<head>`)
 */
export class Renderer<ResolvedPage extends Page> {
	constructor(
		readonly resolver: Resolver<ResolvedPage>,
		readonly render: (
			(newPage: ResolvedPage, oldPage: ResolvedPage, newRoute: URL) => void | Promise<void>
		) = (newPage, oldPage) => {
			if (oldPage !== undefined) {
				oldPage.replaceWith(newPage.render());
			}
		}
	) {
		resolver.subscribe(async(page, { previous }) => {
			const to = this.resolver.router.value;
			await this.render(page, previous, to);

			if (previous !== undefined) {
				window.history.pushState({}, ``, to.pathname); // Setting the hash here causes the jumpanchor to not be activated for some reason, so we do it on the next line
				if (to.hash.length > 0) {
					location.hash = to.hash;
				}
			}
		});
	}
}
