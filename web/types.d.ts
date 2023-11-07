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
	/** By default, ESBuild bundles all code into one file, including dynamic imports. If this parameter is specified, and this page is loaded by dynamic import, ESBuild will "split" the page's code from the rest of the bundle into a file named `{pathName}.html.js` and update the dynamic import to point to that file. */
	importMetaUrl?: string;
	title?: string;
};

export type Resolver = (input: RoutePath) => string | undefined | Promise<string | undefined>;

export interface Routes {
	[key: string]: string | Routes;
}

export type RoutePath = string | RoutePathFunction;

export type RoutePathFunction = (params: any) => string; // eslint-disable-line @typescript-eslint/no-explicit-any

export type RouterContext = typeof routerContexts[number];

export type Template<
	TemplateArgs extends Args = Args
> = (...args: TemplateArgs) => string | Promise<string>;

