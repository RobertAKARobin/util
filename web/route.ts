import type { App, RouteMap } from './app.ts';
import { Component, toAttributes } from './component.ts';

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
