import { appContext } from './context.ts';
import { Emitter } from './emitter.ts';

export const hasExtension = /\.\w+$/;
export const hasHash = /#.*$/;

export function routes<Routes extends Record<string, string>>(
	routes: Routes
): Record<keyof Routes, URL> {
	const output = {} as Record<keyof Routes, URL>;

	const baseHref = appContext === `browser`
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
				url = new URL(baseHref.href + routePath);
			} catch {
				throw new Error(`Path '${routePath}' for route '${key}' can't be parsed as a valid URL`);
			}
		}
		output[routeName] = url;
	}

	return output;
}

export class Router<Routes extends Record<string, URL>, View> {
	readonly url = new Emitter<URL>();

	constructor(
		readonly routes: Routes,
		readonly resolve: (url: URL) => View | Promise<View>,
		readonly onView: (view: View, url: URL) => void | Promise<void>
	) {
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
			const view = await this.resolve(nav.to);
			await this.onView(view, nav.to);
			window.history.pushState({}, ``, this.url.last.pathname); // Setting the hash here causes the jumpanchor to not be activated for some reason
			if (this.url.last.hash.length > 0) {
				location.hash = this.url.last.hash;
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

	to(routeName: keyof Routes) {
		const route = this.routes[routeName];
		this.url.next(route);
	}
}
