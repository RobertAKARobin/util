import { RouteComponent } from '@robertakarobin/web/index.ts';

import { app } from '../app.ts';

export class Route extends RouteComponent {
	app = app;
}

export default Route.toFunction(Route);
