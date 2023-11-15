import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

export type RouteMap = Record<string, string>;

export type Resolver<Routes extends RouteMap> = (
	path: Routes[keyof Routes],
	routes: Routes,
) => string | undefined | Promise<string | undefined>;

export const hasExtension = /\.\w+$/;
export const hasHash = /#.*$/;

export class App<
	Routes extends RouteMap
> {
	readonly path = new Emitter<Routes[keyof Routes]>();

	constructor(
		readonly routes: Routes,
		readonly resolver: Resolver<Routes>,
	) {
		for (const key in this.routes) {
			const routeName: keyof Routes = key;
			let path = this.routes[routeName] as string;
			let hash: string | undefined;
			path = path.replace(hasHash, match => {
				hash = match;
				return ``;
			});
			if (!path.endsWith(`/`) && !hasExtension.test(path)) {
				path = `${path}/`;
			}
			if (typeof hash !== `undefined`) {
				path = `${path}${hash}`;
			}
			this.routes[routeName] = path as Routes[keyof Routes];
		}
	}

	async resolve(path: Routes[keyof Routes]) {
		return await this.resolver(path, this.routes);
	}
}
