import { Component, toAttributes } from './component.ts';
import type { App } from './app.ts';

const absoluteUrl = /^\w+\:\/\//;

export abstract class RouteComponent<
	AppInstance extends App<any> = App<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
	Routes extends (
		AppInstance extends App<infer Routes> ? Routes : never
	) = AppInstance extends App<infer Routes> ? Routes : never
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
