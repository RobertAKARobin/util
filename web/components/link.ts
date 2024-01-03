import { baseUrl } from '@robertakarobin/util/context.ts';

import { type RouteMap, type Router } from '../router.ts';

export function LinkFactory<
	AppRoutes extends RouteMap,
	AppRouter extends Router<AppRoutes>,
>(router: AppRouter) {
	return function(
		routeName: keyof AppRouter[`urls`],
		content?: string,
	) {
		const url = router.urls[routeName as keyof AppRoutes]; // TODO3: Don't know why `keyof AppRoutes` is necessary
		const isExternal = url.origin !== baseUrl.origin;
		if (isExternal) {
			return `
				<a
					href=${url}
					rel="noopener"
					target="_blank"
				>${content}</a>`;
		} else {
			return `
				<a
					href=${router.paths[routeName as keyof AppRoutes]}
				>${content}</a>`;
		}
	};
};
