import { baseUrl } from '@robertakarobin/util/context.ts';

import { type RouteMap, type Router } from '../router.ts';
import { ComponentFactory } from '../component.ts';

export function LinkComponent<Routes extends RouteMap>(router: Router<Routes>) {
	return class Link extends ComponentFactory(`a`, {
		'data-route-name': {
			default: undefined as unknown as keyof typeof router.urls,
		},
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
