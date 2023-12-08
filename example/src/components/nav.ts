import { Component } from '@robertakarobin/web/component.ts';

import { Link, routes } from '@src/router.ts';

export class Nav extends Component {
	static {
		this.init();
	}

	template = () => `
	<nav>
		<ul>
			${Object.entries(routes).map(([routeName, route]) => `
				<li>${
					new Link()
						.set(route)
						.render(`Go ${routeName}`)
				}</li>
			`).join(``)}
		</ul>
	</nav>
	`;
}
