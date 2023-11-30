import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import { appContext } from './context.ts';
import { Component } from './component.ts';
import { Page } from './page.ts';

export const hasExtension = /\.\w+$/;
export const hasHash = /#.*$/;

export type RouteMap = Record<string, string>;

/**
 * Resolves the current URL to a page
 */
export class Router<Routes extends RouteMap> {
	readonly baseHref: URL;
	readonly routes = {} as Record<keyof Routes, URL>;
	readonly url = new Emitter<URL>();

	constructor(
		routes: Routes,
		readonly resolve: (
			this: Router<Routes>,
			url: URL,
		) => Page | undefined | Promise<Page | undefined>
	) {
		this.baseHref = appContext === `browser`
			? new URL(document.baseURI)
			: new URL(`https://example.com`);

		// Populate route URLs
		for (const key in routes) {
			const routeName: keyof Routes = key;
			let routePath = routes[routeName] as string;
			routePath = routePath.startsWith(`/`) ? routePath.substring(1) : routePath;
			let url: URL;
			try {
				url = new URL(routePath);
			} catch {
				try {
					url = new URL(this.baseHref.href + routePath);
				} catch {
					throw new Error(`Path '${routePath}' for route '${key}' can't be parsed as a valid URL`);
				}
			}
			this.routes[routeName] = url;
		}

		this.url.subscribe((to, from) => {
			void this.onNav({ from, to });
		}, { strong: true });

		if (appContext === `browser`) {
			window.onpopstate = () => { // Popstate is fired only by performing a browser action on the current document, e.g. back, forward, or hashchange
				const newRoute = new URL(window.location.href);
				this.url.next(newRoute);
			};

			window.onhashchange = () => { // Hashchange is fired _after_ popstate
				const newRoute = new URL(window.location.href);
				this.url.next(newRoute);
			};
		}
	}

	private async onNav(nav: { from?: URL; to: URL; }) {
		if (nav.to.pathname !== nav.from?.pathname) { // On new page
			const page = await this.resolve(nav.to);
			if (page) {
				Page.current.next(page);
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
			if (this.url.last.hash.length === 0) {
				window.history.replaceState({}, ``, this.url.last.pathname); // Turns out `location.hash = ''` will still set a hash of `#`. So, if going from a path with hash to path without hash, we'll need to handle the hash differently
			}
		}
	}

	/**
	 * When `Page.current` changes, attach it to the provided HTML element and render it
	 */
	setOutlet($outlet: Element) {
		const url = new URL(window.location.href);
		this.url.next(url); // This has to come before the page subscription or the landing page gets crabby

		Page.current.subscribe(page => {
			while ($outlet.firstChild) {
				$outlet.removeChild($outlet.lastChild!);
			}

			document.title = page.title;
			$outlet.insertAdjacentHTML(`beforeend`, page.template());
			page.setEl($outlet.firstElementChild!);

			window.history.pushState({}, ``, this.url.last.pathname); // Setting the hash here causes the jumpanchor to not be activated for some reason
			if (this.url.last.hash.length > 0) {
				location.hash = this.url.last.hash;
			}
		}, { strong: true });
	}

	to(routeName: keyof Routes) {
		const route = this.routes[routeName];
		this.url.next(route);
	}
}

/**
 * Use in place of `<a>` to link to a different path/page
 */
export abstract class RouteComponent<
	Routes extends RouteMap
> extends Component<RouteComponent<Routes>> {
	abstract readonly router: Router<Routes>;

	accept({ to, ...attributes }: {
		to: keyof Routes;
	}) {
		this.attributes = attributes;
		const route = this.router.routes[to];
		const isAbsolute = route.origin !== this.router.baseHref.origin;
		return {
			href: isAbsolute ? route.href : `${route.pathname}${route.hash ?? ``}`,
			isAbsolute,
			route,
			routeName: to,
		};
	}

	onClick(event: MouseEvent) {
		if (event.metaKey || event.ctrlKey) { // Allow opening in new tab
			return;
		}
		event.preventDefault();
		this.router.to(this.state.last.routeName);
	}

	template = (content: string = ``) => {
		return `<a href="${this.state.last.href}" onclick=${this.bind(`onClick`)}>${content}</a>`;
	};
}

/**
 * Registers a component that can be used in place of `<a>` tags to navigate between app routes
 */
export function routeComponent<Routes extends RouteMap>(
	router: Router<Routes>
) {
	class AppRouteComponent extends RouteComponent<Routes> {
		router = router;
	}

	return Component.toFunction(AppRouteComponent);
}
