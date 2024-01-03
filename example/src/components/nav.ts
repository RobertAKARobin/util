import { Component } from '@robertakarobin/web/component.ts';

import { link, routeNames } from '@src/router.ts';

export class Nav extends Component.custom(`nav`) {
	template = () => `
<ul>
	${routeNames.map(routeName => `
		<li>${link(routeName, `Go ${routeName}`)}</li>
	`).join(``)}
</ul>
	`;
}

export const nav = Component.init(Nav);
