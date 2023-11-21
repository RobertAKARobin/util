import { Component } from '@robertakarobin/web/index.ts';

import { routes, routeTo } from '../router.ts';

export class Nav extends Component {
	template = () => `
		<ul>
			${Object.keys(routes).map(routeName => `
				<li>${this.put(routeTo(routeName as keyof typeof routes, `Go ${routeName}`))}</li>
			`).join(``)}
		</ul>
	`;
}

export default Component.register(Nav);
