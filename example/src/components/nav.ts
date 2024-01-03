import { Component } from '@robertakarobin/web/component.ts';

import { Link, routeNames } from '@src/router.ts';

@Component.define()
export class Nav extends Component {
	template = () => `
<ul>
	${routeNames.map(routeName => `
		<li>${Link(routeName, `Go ${routeName}`)}</li>
	`).join(``)}
</ul>
	`;
}
