import type { RouteMap, Router, Routes } from '@robertakarobin/jsutil/router.ts';
export { buildRoutes, Router } from '@robertakarobin/jsutil/router.ts';

import { Component } from './component.ts';

/**
 * Use in place of `<a>` to link to a different path/page
 */
export abstract class RouteComponent extends Component<{ to: keyof RouteMap_; }> {
	get route() {
		return this.router.routes[this.last.to];
	}
	readonly router: Router_;

	constructor(args: {
		router: Router_;
		to: keyof RouteMap_;
	}) {
		super(args);
		this.router = args.router;
	}

	onClick(event: MouseEvent) {
		if (event.metaKey || event.ctrlKey) { // Allow opening in new tab
			return;
		}
		event.preventDefault();
		this.router.to(this.last.to);
	}

	template = (content: string = ``) =>
		`<a href="${this.route.href}" onclick=${this.bind(`onClick`)}>${content}</a>`;
}

/**
 * A component that can be used in place of `<a>` tags to navigate between app routes
 */
export function routeComponent<
	RouteMap_ extends RouteMap,
	Router_ extends Router<RouteMap_, never>,
>(router: Router_) {
	return class AppRouteComponent extends RouteComponent<RouteMap_, Router_> {
		constructor(args: Omit<
			ConstructorParameters<typeof RouteComponent<RouteMap_, Router_>>[0],
			`router`
		>) {
			super({ ...args, router });
		}
	};
}
