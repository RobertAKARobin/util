import { Component } from '@robertakarobin/web/index.ts';

import { router, routeTo } from '../router.ts';

export class Nav extends Component {
	template = () => `
		<ul>
			${Object.keys(router.routes).map(routeName => `
				<li>${this.put(routeTo(routeName as keyof typeof router.routes, `Go ${routeName}`))}</li>
			`).join(``)}
		</ul>
	`;
}

export default Component.register(Nav);
