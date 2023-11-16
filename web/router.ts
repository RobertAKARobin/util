import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import { Component, toAttributes } from './component.ts';
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
			if (typeof hash !== `undefined`) {
				path = `${path}${hash}`;
			}
			this.routes[routeName] = path as Routes[keyof Routes];
		}
	}

	async resolve(path: Routes[keyof Routes]) {
		return await this.resolver(path, this.routes);
	}

	setOutlet(input: HTMLElement) {
		window.onpopstate = () => {
			const newPath = window.location.pathname;
			if (newPath !== this.path.last) {
				this.path.next(newPath as Routes[keyof Routes]);
			}
		};

		this.path.subscribe(async path => {
			const page = await this.resolve(path);
			if (page) {
				Page.current.next(page);
			}
		});

		const $outlet = typeof input === undefined ? document.body : input;
		Page.current.subscribe(async page => {
			document.title = page.title;
			$outlet.innerHTML = await page.render();
		});
	}
}

export abstract class GenericRouteComponent<
	Routes extends RouteMap
> extends Component {
	abstract readonly router: Router<Routes>;

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

	template(
		routeName: keyof Routes,
		content: string = ``,
		rest: Record<string, string> = {}
	) {
		const url = this.router.routes[routeName];
		const isAbsolute = isAbsoluteUrl.test(url);
		return `
			<a
				href="${url}"
				onclick=${this.bind(`onClick`, url)}
				target="${isAbsolute ? `_blank` : `_self`}"
				${toAttributes(rest)}
				>
				${content || ``}
			</a>
		`;
	}
}

/**
 * This is separate from `Router` because Router depends on templates, which depend on hashes, which depend on Router, which causes a circular dependency that makes Typescript unhappy.
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
	class RouteComponent extends GenericRouteComponent<Routes> {
		router = router;
	}
	return RouteComponent.toFunction(RouteComponent);
}
