import { Component, router } from '../index.ts';

import { toAttributes } from './toAttributes.ts';

const absoluteUrl = /^\w+\:\/\//;

export class Link extends Component {
	routeTo(event: MouseEvent, path: string) {
		if (event.metaKey || event.ctrlKey) { // Allow opening in new tab
			return;
		}

		event.preventDefault();
		window.history.pushState({}, ``, path);
		router.next(path);
	}

	template({ href, content, ...rest }: {
		content: string;
		href: string; // I thought about making `link` accept just the route's name, but that starts getting complicated if the route is a function with parameters
	}) {
		const isAbsolute = absoluteUrl.test(href);
		return `
			<a
				href="${href}"
				onclick=${this.bind(`routeTo`, href)}
				target="${isAbsolute ? `_blank` : `_self`}"
				${toAttributes(rest)}
				>
				${content || ``}
			</a>
		`;
	}
}

export default Component.toFunction(Link);
