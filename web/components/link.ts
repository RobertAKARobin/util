import { baseUrl } from '@robertakarobin/util/context.ts';
import type { FromIndex1 } from '@robertakarobin/util/types.d.ts';

import { Component } from '../component.ts';
import { type Router } from '../router.ts';

export class Link<AppRouter extends Router> extends Component.custom(`a`) {
	@Component.attribute() routeName: keyof Router[`urls`];
	readonly router: AppRouter;

	constructor(
		router: AppRouter,
		routeName: keyof Router[`urls`],
		content?: string,
	) {
		super();
		this.router = router;
		this.routeName = routeName;
		this.write(content);
	}

	onChange(attributeName: string) {
		if (attributeName === `data-route-name`) {
			const isExternal = this.router.urls[this.routeName].origin !== baseUrl.origin;
			if (isExternal) {
				this.set({
					href: this.router.urls[this.routeName].toString(),
					rel: `noopener` as string,
					target: `_blank` as string,
				});
			} else {
				this.set({
					href: this.router.paths[this.routeName],
				});
			}
		}
	}
};

const buildLink = Component.init(Link);

export const LinkFactory = (router: Router) =>
	(...args: FromIndex1<ConstructorParameters<typeof Link>>) =>
		buildLink(router, ...args);

