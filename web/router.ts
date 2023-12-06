import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import { appContext, baseHref, defaultBaseUrl } from './context.ts';
import { Component, html } from './component.ts';

export const hasExtension = /\.\w+$/;

export class Route extends URL {
	readonly idAttr: string;
	readonly isExternal: boolean;
	constructor(...[input]: ConstructorParameters<typeof URL>) {
		super(input, baseHref);
		if (!hasExtension.test(this.pathname)) {
			if (!this.pathname.endsWith(`/`)) {
				this.pathname += `/`;
			}
		}
		this.isExternal = this.origin !== baseHref.origin;
		this.idAttr = this.hash.substring(1);
	}
};

export type RouteMap = Record<string, string>;

export class Router<RouteMap_ extends RouteMap = any> extends Emitter<Route> { // eslint-disable-line @typescript-eslint/no-explicit-any
	isReplace = true;
	readonly routes = {} as Record<keyof RouteMap_, Route>;

	constructor(routes: RouteMap_) {
		super();

		for (const key in routes) {
			this.routes[key] = new Route(routes[key]);
		}

		if (appContext === `browser`) {
			window.onpopstate = () => { // Popstate is fired only by performing a browser action on the current document, e.g. back, forward, or hashchange
				this.set(new Route(window.location.href));
			};

			window.onhashchange = () => { // Hashchange is fired _after_ popstate
				this.set(new Route(window.location.href));
			};
		}
	}
}

export class Resolver<View> extends Emitter<View> {
	isReplace = true;

	constructor(
		readonly router: Router<never>,
		readonly resolve: (to: Route, from?: Route) => View | Promise<View>,
	) {
		super();

		router.subscribe(async(to, { previous }) => {
			if (to.href === previous?.href) { // On no change
				return;
			}

			if (to.pathname !== previous?.pathname) { // On new page
				this.set(await this.resolve(to, previous));
				return;
			}

			if (to.origin !== baseHref.origin && to.origin !== defaultBaseUrl.origin) { // On external
				location.href = to.href;
				return;
			}

			if (to.hash !== previous?.hash) { // On same page with new hash
				location.hash = to.hash;
				if (to.hash?.length === 0) {
					window.history.replaceState({}, ``, to.pathname); // Turns out `location.hash = ''` will still set a hash of `#`. So, if going from a path with hash to path without hash, we'll need to handle the hash differently
				}
			}
		}, { isStrong: true });
	}
}

export class Renderer<View> extends Emitter<View> {
	constructor(
		readonly resolver: Resolver<View>,
		readonly render: (
			newView: View,
			oldView: View,
			newRoute: Route,
		) => void | Promise<void>
	) {
		super();

		resolver.subscribe(async(view, { previous }) => {
			const to = this.resolver.router.value;
			await this.render(view, previous, to);
			if (previous !== undefined) {
				window.history.pushState({}, ``, to.pathname); // Setting the hash here causes the jumpanchor to not be activated for some reason
				if (to.hash.length > 0) {
					location.hash = to.hash;
				}
			}
		}, { isStrong: true });

		const landingRoute = new Route(location.href);
		const toRender = resolver.resolve(landingRoute);
		if (toRender instanceof Promise) {
			toRender
				.then(view => this.resolver.set(view))
				.catch(console.error);
		} else {
			this.resolver.set(toRender);
		}
	}
}

/**
 * Use in place of `<a>` to link to a different path/page
 */
export abstract class LinkComponent<Router_ extends Router = Router> extends Component<Route> {
	isReplace = true;
	abstract readonly router: Router_;

	onClick(event: MouseEvent) {
		if (event.metaKey || event.ctrlKey) { // Allow opening in new tab
			return;
		}
		event.preventDefault();
		this.router.set(this.$);
	}

	template = (content: string = ``) => html`
	<a
		href="${this.$.isExternal ? this.$.href : `${this.$.pathname}${this.$.hash}`}"
		onclick=${this.bind(`onClick`)}
	>${content}</a>
	`;

	to(route: Route) {
		this.set(typeof route === `string` ? new Route(route) : route);
		return this;
	}
}
