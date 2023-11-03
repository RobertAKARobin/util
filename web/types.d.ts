import type { routerContexts } from './index.ts';

export type Args = Array<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export type ComponentArgs<TemplateFunction extends Template> = {
	style?: string;
	template: TemplateFunction;
};

export type Function = (...args: Args) => any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type PageArgs<
	TemplateFunction extends Template
> = ComponentArgs<TemplateFunction> & {
	importMetaUrl?: string;
	title: string;
};

export type PageLayout = Template<[input: {
	contents: string;
	routePath: RoutePath;
	title: string;
}]>;

export type Routes = Record<string, RoutePath>;

export type RoutePath = string | RoutePathFunction;

export type RoutePathFunction = (params: any) => string; // eslint-disable-line @typescript-eslint/no-explicit-any

export type RouterContext = typeof routerContexts[number];

export type Template<
	TemplateArgs extends Args = Args
> = (...args: TemplateArgs) => string | Promise<string>;

