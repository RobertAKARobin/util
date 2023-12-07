import { Component } from '@robertakarobin/util/component.ts';

import { Link, routes } from '@src/router.ts';

export class Nav extends Component {
	static {
		this.init();
	}

	template = () => `<ul>
		${Object.entries(routes).map(([routeName, route]) => `
			<li>${
				new Link().to(route).render(`Go ${routeName}`)
			}</li>
		`).join(``)}
	</ul>
	`;
}
