import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import { appContext } from './context.ts';
import { Component } from './component.ts';
import { Page } from './page.ts';

export const isAbsoluteUrl = /^\w+\:\/\//;
export const hasExtension = /\.\w+$/;
export const hasHash = /#.*$/;

export type RouteMap = Record<string, string>;

export type Resolver<Routes extends RouteMap> = (
	path: Routes[keyof Routes],
	routes: Routes,
) => Page | undefined | Promise<Page | undefined>;

export class Router<
	Routes extends RouteMap
> {
	readonly path = new Emitter<Routes[keyof Routes]>();

	constructor(
		readonly routes: Routes,
		readonly resolver: Resolver<Routes>,
	) {
		for (const key in this.routes) {
			const routeName: keyof Routes = key;
			let path = this.routes[routeName] as string;
			let hash: string | undefined;
			path = path.replace(hasHash, match => {
				hash = match;
				return ``;
			});
			if (!path.endsWith(`/`) && !hasExtension.test(path)) {
				path = `${path}/`;
			}
			if (hash !== undefined) {
				path = `${path}${hash}`;
			}
			this.routes[routeName] = path as Routes[keyof Routes];
		}

		if (appContext === `browser`) {
			window.onpopstate = () => {
				const newPath = window.location.pathname;
				if (newPath !== this.path.last) {
					this.path.next(newPath as Routes[keyof Routes]);
				}
			};
		}

		this.path.subscribe(async path => {
			// TODO1: If newPath is same as oldPath, esp without hash
			const page = await this.resolve(path);
			if (page) {
				Page.current.next(page);
			}
		});
	}

	async resolve(path: Routes[keyof Routes]) {
		return await this.resolver(path, this.routes);
	}

	setOutlet(input: HTMLElement) {
		const $outlet = typeof input === undefined ? document.body : input;

		Page.current.subscribe((page, subscription) => {
			page.$el = $outlet;
			Page.current.unsubscribe(subscription); // On landing page, if SSG, don't want to reset the title or rerender the page
		});

		this.path.next(window.location.pathname as Routes[keyof Routes]);;

		Page.current.subscribe(page => {
			document.title = page.title;
			page.$el = $outlet;
			page.rerender();
		});
	}
}

export abstract class RouteComponent<
	Routes extends RouteMap
> extends Component {
	abstract readonly router: Router<Routes>;

	constructor(
		public routeName: keyof Routes,
		public content: string,
		public attributes = {}
	) {
		super();
	}

	onClick(
		event: MouseEvent,
		path: Routes[keyof Routes],
	) {
		if (event.metaKey || event.ctrlKey) { // Allow opening in new tab
			return;
		}

		event.preventDefault();
		window.history.pushState({}, ``, path);
		this.router.path.next(path);
	}

	template = () => {
		const url = this.router.routes[this.routeName];
		const isAbsolute = isAbsoluteUrl.test(url);
		return `
			<a
				href="${url}"
				onclick=${this.bind(`onClick`, url)}
				target="${isAbsolute ? `_blank` : `_self`}"
				${this.attrs()}
				>
				${this.content || ``}
			</a>
		`;
	};
}

/**
 * This is separate from `Router` because Router depends on templates, which depend on `hashes`, which depend on Router, which causes a circular dependency that makes Typescript unhappy.
 */
export function routeHashes<Routes extends RouteMap>(routes: Routes) {
	const hashes = {} as Record<keyof Routes, string | undefined>;
	for (const routeName in routes) {
		const routePath = routes[routeName];
		const hashPosition = routePath.indexOf(`#`);
		hashes[routeName] = hashPosition >= 0
			? routePath.substring(hashPosition + 1)
			: undefined;
	}
	return hashes;
}

export function routeComponent<Routes extends RouteMap>(
	router: Router<Routes>
) {
	class AppRouteComponent extends RouteComponent<Routes> {
		router = router;
	}
	return Component.register(AppRouteComponent);
}
