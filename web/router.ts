import * as $ from '@robertakarobin/jsutil/index.ts';
import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import { appContext } from './context.ts';
import { Component } from './component.ts';
import { Page } from './page.ts';

export const hasExtension = /\.\w+$/;
export const hasHash = /#.*$/;

export type RouteMap = Record<string, string>;

const defaultOrigin = `https://example.com/`; // Let's just hope this isn't used on example.com
const defaultOriginUrl = new URL(defaultOrigin);

/**
 * Resolves the current URL to a page
 */
export class Router<Routes extends RouteMap> {
	private navigationCount = -1;
	readonly routes = {} as Record<keyof Routes, URL>;
	readonly url = new Emitter<URL>();

	constructor(
		routes: Routes,
		readonly resolver: (
			this: Router<Routes>,
			url: URL,
		) => Page | undefined | Promise<Page | undefined>
	) {
		for (const key in routes) {
			const routeName: keyof Routes = key;
			let routePath = routes[routeName] as string;
			routePath = routePath.startsWith(`/`) ? routePath.substring(1) : routePath;
			let url: URL;
			try {
				url = new URL(routePath);
			} catch {
				try {
					url = new URL(defaultOrigin + routePath);
				} catch {
					throw new Error(`Path '${routePath}' for route '${key}' can't be parsed as a valid URL`);
				}
			}
			this.routes[routeName] = url;
		}

		this.url.subscribe(async url => {
			this.navigationCount += 1;
			const page = await this.resolve(url);
			if (page) {
				Page.current.next(page);
			}
		});

		if (appContext === `browser`) {
			window.onpopstate = () => {
				const newRoute = new URL(window.location.href);
				if (newRoute.href !== this.url.last?.href) {
					this.url.next(newRoute);
				}
			};

			this.url.next(new URL(window.location.href));
		}
	}

	/**
	 * Convert a Router path to a Page
	 */
	async resolve(url: URL) {
		return await this.resolver(url);
	}

	/**
	 * When `Page.current` changes, attach it to the provided HTML element and render it
	 */
	setOutlet($input: HTMLElement) {
		const $outlet = typeof $input === undefined ? document.body : $input;

		Page.current.subscribe(page => {
			page.$outlet = $outlet;

			if (this.navigationCount > 0) {
				document.title = page.title;
				page.rerender();
			}
		});
	}
}

/**
 * Use in place of `<a>` to link to a different path/page
 */
export class RouteComponent<
	Routes extends RouteMap
> extends Component {
	readonly content: string;
	readonly href: string;
	readonly isAbsolute: boolean;
	readonly route: typeof this.router.routes[keyof Routes];
	readonly router: Router<Routes>;

	constructor(input: {
		router: Router<Routes>;
		to: keyof Routes;
		txt?: string;
	}) {
		super($.omit(input, `router`, `to`, `txt`));
		this.router = input.router;
		this.route = this.router.routes[input.to];
		this.isAbsolute = this.route.origin !== defaultOriginUrl.origin;
		this.href = this.isAbsolute ? this.route.href : this.route.pathname;
		this.content = input.txt ?? (
			this.isAbsolute ? this.route.href : this.route.pathname
		);
	}

	onClick(event: MouseEvent) {
		if (event.metaKey || event.ctrlKey) { // Allow opening in new tab
			return;
		}

		event.preventDefault();
		window.history.pushState({}, ``, this.route.pathname);
		this.router.url.next(this.route);
	}

	template = () => {
		return `<a href="${this.href}" onclick=${this.bind(`onClick`)} ${this.attrs()}>${this.content}</a>`;
	};
}

/**
 * Registers a component that can be used in place of `<a>` tags to navigate between app routes
 */
export function routeComponent<Routes extends RouteMap>(
	router: Router<Routes>
) {
	class AppRouteComponent extends RouteComponent<Routes> {
		constructor(
			args: Omit<ConstructorParameters<typeof RouteComponent<Routes>>[0], `router`>
		) {
			super({
				...args,
				router,
			});
		}
	}

	AppRouteComponent.init();

	return Component.toFunction(AppRouteComponent);
}
