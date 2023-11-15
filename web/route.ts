import { Component, toAttributes } from './component.ts';
import type { App } from './app.ts';
import { type RouteMap } from '@robertakarobin/web/index.ts';

const absoluteUrl = /^\w+\:\/\//;

export abstract class RouteComponent<
	Routes extends RouteMap
> extends Component {
	abstract readonly app: App<Routes>;

	routeTo(
		event: MouseEvent,
		path: Routes[keyof Routes],
	) {
		if (event.metaKey || event.ctrlKey) { // Allow opening in new tab
			return;
		}

		event.preventDefault();
		window.history.pushState({}, ``, path);
		this.app.path.next(path);
	}

	template(
		routeName: keyof Routes,
		content: string = ``,
		rest: Record<string, string> = {}
	) {
		const url = this.app.routes[routeName];
		const isAbsolute = absoluteUrl.test(url);
		return `
			<a
				href="${url}"
				onclick=${this.bind(`routeTo`, url)}
				target="${isAbsolute ? `_blank` : `_self`}"
				${toAttributes(rest)}
				>
				${content || ``}
			</a>
		`;
	}
}

export const routeFactory = <Routes extends RouteMap>(
	app: App<Routes>
) => {
	class AppRouteComponent extends RouteComponent<typeof app.routes> {
		app = app;
	}
	return AppRouteComponent.toFunction(AppRouteComponent);
};
