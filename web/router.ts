import { Route, type Router } from '@robertakarobin/jsutil/router.ts';

import { Component } from './component.ts';

/**
 * Use in place of `<a>` to link to a different path/page
 */
export abstract class RouteComponent<Router_ extends Router = Router> extends Component<Route> {
	abstract readonly router: Router_;

	constructor(args: Route & ConstructorParameters<typeof Component>[0]) {
		super(typeof args === `string` ? new Route(args) : args);
	}

	onClick(event: MouseEvent) {
		if (event.metaKey || event.ctrlKey) { // Allow opening in new tab
			return;
		}
		event.preventDefault();
		this.router.next(this.last);
	}

	template = (content: string = ``) => `
	<a
		href="${this.last.isExternal ? this.last.href : `${this.last.pathname}${this.last.hash}`}"
		onclick=${this.bind(`onClick`)}
	>${content}</a>`;
}
