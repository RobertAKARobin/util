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
			const link = new this()
				.set({ routeName })
				.content(contents);
			link.onChange();
			return link;
		}

		isHydrated = false;

		onChange() {
			const isExternal = router.urls[this.data.routeName].origin !== baseUrl.origin;
			if (isExternal) {
				this.attrs({
					href: router.urls[this.data.routeName].toString(),
					rel: `noopener`,
					target: `_blank`,
				});
			} else {
				this.attrs({
					href: router.paths[this.data.routeName],
				});
			}
		}
	};
}
