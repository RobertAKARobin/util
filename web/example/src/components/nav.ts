import { Component } from '@robertakarobin/web/component.ts';

import { routes, RouteTo } from '@src/router.ts';

RouteTo.init();

export class Nav extends Component {
	template = () => `<ul>
		${Object.entries(routes).map(([routeName, route]) => `
			<li>${
				new RouteTo(route).render(`Go ${routeName}`)
			}</li>
		`).join(``)}
	</ul>
	`;
}
