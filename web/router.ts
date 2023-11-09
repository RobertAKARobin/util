import { Emitter } from '@robertakarobin/emit/index.ts';

export const routerContexts = [
	`browser`,
	`build`,
] as const;

export type RouterContext = typeof routerContexts[number];

export const routerContext: RouterContext = typeof window !== `undefined`
	? `browser`
	: `build`;

export class Router extends Emitter<string> {
	constructor() {
		super();

		if (routerContext === `browser`) {
			window.onpopstate = this.onChange.bind(this);
		}
	}

	onChange() {
		const newPath = window.location.pathname;
		if (newPath !== this.last) {
			this.next(newPath);
		}
	}
}

export const router = new Router();

export type RouteMap = Record<string, string>;

export const hasExtension = /\.\w+$/;
export const hasHash = /#.*$/;
export const isRelativePath = /^\.\.?\/.*/;

export const routeMap = < // TODO2: Nested routes? Kinda prefer flat routes
	Routes extends RouteMap = RouteMap
>(input: Routes): Routes => {
	const output = {} as RouteMap;
	for (const key in input) {
		const route = input[key];
		let path: string = route;
		if (!path.endsWith(`/`) && !hasExtension.test(path)) {
			path = `${path}/`;
		}
		output[key] = path;
	}
	return output as Routes;
};

export type Resolver<
	Routes extends RouteMap = RouteMap
> = (path: Routes[keyof Routes]) => string | undefined | Promise<string | undefined>;

export const resolver = <Routes extends RouteMap>(
	routes: Routes,
	onRoute: Resolver<Routes>
) => {
	return onRoute;
};
