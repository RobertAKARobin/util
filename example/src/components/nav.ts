import { Component } from '@robertakarobin/web/component.ts';

import { paths } from '@src/router.ts';

export class Nav extends Component {
	static {
		this.init();
	}

	template = () => `
	<nav>
		<ul>
			${Object.entries(paths).map(([routeName, route]) => `
				<li>
					<a href="${route}">Go ${routeName}</a>
				</li>
			`).join(``)}
		</ul>
	</nav>
	`;
}
