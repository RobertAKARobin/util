import { Component } from '@robertakarobin/util/component.ts';

import { router } from '@src/app.ts';

const style = /*css*/`
:host {
	color: #444444;
}
`;

@Component.define({ style })
export class Nav extends Component.custom(`nav`) {
	template = () => /*html*/`
<ul>
	${router.routeNames.map(routeName => /*html*/`
		<li id="nav-${routeName}">
			${routeName === router.findCurrentRouteName() ? `Active: ` : ``}
			${router.link(routeName, `Go ${routeName}`)}
		</li>
	`).join(``)}
</ul>
`;
}
