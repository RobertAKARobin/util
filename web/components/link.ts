import { baseUrl } from '@robertakarobin/util/context.ts';

import { type RouteMap, type Router } from '../router.ts';
import { Component } from '../component.ts';

export function LinkComponent<Routes extends RouteMap>(router: Router<Routes>) {
	return class Link extends Component(`a`, {
		routeName: undefined as unknown as keyof typeof router.urls,
	}) {
		static {
			this.init();
		}

		static to(
			routeName: keyof typeof router.urls,
			contents?: string,
		) {
			return new this()
				.set({ routeName })
				.content(contents);
		}

		isHydrated = false;

		template = () => router.urls[this.data.routeName].origin === baseUrl.origin
			? `<a href="${router.paths[this.data.routeName]}">${this.contents}</a>`
			: `<a
	href="${router.urls[this.data.routeName]}"
	rel="noopener"
	target="_blank"
>${this.contents}</a>`;
	};
}
