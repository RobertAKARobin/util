import { type RouteMap, type Router } from '../router.ts';
import { baseUrl } from '@robertakarobin/util/context.ts';
import { Component } from '../component.ts';

export function LinkComponent<Routes extends RouteMap>(router: Router<Routes>) {
	return class Link extends Component<keyof typeof router.urls> {
		static {
			this.init();
		}

		static to(
			routeName: keyof typeof router.urls,
			contents?: string,
		) {
			const link = this.get().set(routeName);
			if (contents !== undefined) {
				link.content(contents);
			}
			return link;
		}

		isHydrated = false;

		template = () => router.urls[this.value].origin === baseUrl.origin
			? `<a href="${router.paths[this.value]}">${this.contents}</a>`
			: `<a
	href="${router.urls[this.value]}"
	rel="noopener"
	target="_blank"
>${this.contents}</a>`;
	};
}
