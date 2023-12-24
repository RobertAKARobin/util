import { baseUrl } from '@robertakarobin/util/context.ts';

import { type RouteMap, type Router } from '../router.ts';
import { Component } from '../component.ts';

export function LinkComponent<Routes extends RouteMap>(router: Router<Routes>) {
	return class Link extends Component(`a`, {
		'data-route-name': null as unknown as keyof typeof router.urls,
	}) {
		static {
			this.init();
		}

		static to(
			routeName: keyof typeof router.urls,
			contents?: string,
		) {
			return new this({ 'data-route-name': routeName }).content(contents);
		}

		isHydrated = false;

		onChange(attributeName: string) {
			if (attributeName === `data-route-name`) {
				const isExternal = router.urls[this.get(`data-route-name`)].origin !== baseUrl.origin;
				if (isExternal) {
					this.setAttributes({
						href: router.urls[this.get(`data-route-name`)].toString(),
						rel: `noopener`,
						target: `_blank`,
					});
				} else {
					this.setAttributes({
						href: router.paths[this.get(`data-route-name`)],
					});
				}
			}
		}
	};
}
