import type { routerContexts, routerTypes } from './index.ts';
import type { buildOptionsDefaults } from './build.ts';

export type Args = Array<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export type BuildOptions = typeof buildOptionsDefaults;

export type Component<
	TemplateArgs extends Args = Args
> = {
	style?: string;
	template: Template<TemplateArgs>;
};

export type Resolver = (input: {
	path: RoutePath;
	routerContext: RouterContext;
	routerType: RouterType;
}) => string;

export type Routes = Record<string, RoutePath>;

export type RouteFunction = (params: any) => string; // eslint-disable-line @typescript-eslint/no-explicit-any

export type RoutePath = string | RouteFunction;

export type RouterContext = typeof routerContexts[number];

export type RouterType = typeof routerTypes[number];

export type Template<
	TemplateArgs extends Args = Args
> = (...args: TemplateArgs) => string;
