import { Component } from '@robertakarobin/web/component.ts';

import { Link, routes } from '@src/router.ts';

Link.init();

export class Nav extends Component {
	template = () => `<ul>
		${Object.entries(routes).map(([routeName, route]) => `
			<li>${
				new Link().to(route).render(`Go ${routeName}`)
			}</li>
		`).join(``)}
	</ul>
	`;
}
