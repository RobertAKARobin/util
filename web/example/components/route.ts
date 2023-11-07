import { RouteComponent } from '@robertakarobin/web/index.ts';

import { routes } from '../routes.ts';

export class Route extends RouteComponent<typeof routes> {
	routes = routes;
}

export default Route.toFunction(Route);
