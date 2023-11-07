import { Component, toAttributes } from './component.ts';
import { type RouteMap, type Router, router } from './router.ts';

const absoluteUrl = /^\w+\:\/\//;

export abstract class RouteComponent<
	Routes extends RouteMap
> extends Component {
	protected readonly router: Router = router;
	abstract readonly routes: Routes;

	routeTo(event: MouseEvent, path: string) {
		if (event.metaKey || event.ctrlKey) { // Allow opening in new tab
			return;
		}

		event.preventDefault();
		window.history.pushState({}, ``, path);
		this.router.next(path);
	}

	template(
		routeName: keyof Routes,
		content: string = ``,
		rest: Record<string, string> = {}
	) {
		const url = this.routes[routeName];
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
