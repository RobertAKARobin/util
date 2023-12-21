import { type RouteMap, type Router } from '../router.ts';
import { baseUrl } from '@robertakarobin/util/context.ts';
import { Component } from '../component.ts';

export function LinkComponent<Routes extends RouteMap>(router: Router<Routes>) {
	return class Link extends Component(`a`) {
		static {
			this.init();
		}

		static to(
			routeName: keyof typeof router.urls,
			contents?: string,
		) {
			const link = new this(routeName);
			if (contents !== undefined) {
				link.content(contents);
			}
			return link;
		}

		isHydrated = false;

		constructor(
			public routeName: keyof typeof router.urls
		) {
			super();
		}

		template = () => router.urls[this.routeName].origin === baseUrl.origin
			? `<a href="${router.paths[this.routeName]}">${this.contents}</a>`
			: `<a
	href="${router.urls[this.routeName]}"
	rel="noopener"
	target="_blank"
>${this.contents}</a>`;
	};
}
