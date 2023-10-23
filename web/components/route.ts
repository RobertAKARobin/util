import { bind, RouteFunction, router, Routes } from '../index.ts';

const routeTo = (event: Event, path: string) => {
	event.preventDefault();
	window.history.pushState({}, ``, path);
	router.next(path);
};

export const link = (
	href: string,
	content?: string
) => `
	<a
		href="${href}"
		onclick=${bind(routeTo, href)}
		>
		${content || ``}
	</a>
`;

/**
 * Given a dictionary of routes, returns a component function that accepts just the route name and returns a link/anchor to that route
 */
export const routeFactory = <CustomRoutes extends Routes>(
	routes: CustomRoutes
) => {
	function out<
		RouteName extends keyof CustomRoutes,
		RoutePath extends (CustomRoutes[RouteName] extends string ? string : never),
	>(
		routeName: RouteName,
		content?: string,
	): RoutePath;

	function out<
		RouteName extends keyof CustomRoutes,
		RoutePath extends (
			CustomRoutes[RouteName] extends RouteFunction ? CustomRoutes[RouteName] : never
		),
	>(
		routeName: RouteName,
		params: Parameters<RoutePath>[0],
		content?: string
	): ReturnType<RoutePath>; // TODO2: When required params aren't provided, this returns `never`, which ESLint doesn't yet warn about: https://github.com/typescript-eslint/typescript-eslint/issues/2616

	function out<
		RouteName extends keyof CustomRoutes,
		RoutePath = CustomRoutes[RouteName],
	>(
		routeName: RouteName,
		params: RoutePath extends RouteFunction ? Parameters<RoutePath>[0] : string,
		contentIfFunction?: string,
	): string {
		const path = routes[routeName] as RoutePath;
		const href: string = typeof path === `function`
			? path(params) as string
			: path as string;
		const content: string | undefined = typeof path === `function`
			? contentIfFunction
			: params as string;
		return link(href, content || (routeName as string));
	};
	return out;
};
