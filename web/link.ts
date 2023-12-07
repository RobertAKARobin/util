import { Component, html } from './component.ts';
import { Route, type Router } from './router.ts';

// I put this in its own file instead of in router.ts so that Router can be used with or without importing Components

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
