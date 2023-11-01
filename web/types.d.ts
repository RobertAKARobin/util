import type { buildOptionsDefaults } from './build.ts';
import type { routerContexts } from './index.ts';

export type Args = Array<unknown>; // eslint-disable-line @typescript-eslint/no-explicit-any

export type BuildOptions = typeof buildOptionsDefaults;

export type Function = (...args: Args) => unknown; // eslint-disable-line @typescript-eslint/no-explicit-any

export type PageLayout = (title: string, contents: string) => string;

export type Resolver = (path: RoutePath) => string | Promise<string>;

export type Routes = Record<string, RoutePath>;

export type RoutePath = string | RoutePathFunction;

export type RoutePathFunction = (params: any) => string; // eslint-disable-line @typescript-eslint/no-explicit-any

export type RouterContext = typeof routerContexts[number];

export type Template = (...args: Args) => string | Promise<string>;

