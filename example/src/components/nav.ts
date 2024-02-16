import { Component, css, html } from '@robertakarobin/util/component.ts';

import { link } from '@src/components/link.ts';
import { router } from '@src/app.ts';

const style = css`
:host {
	color: #444444;
}
`;

@Component.define({ style })
export class Nav extends Component.custom(`nav`) {
	template = () => html`
<ul>
	${[...router.routeNames].map(routeName => html`
		<li id="nav-${routeName}">
			${routeName === router.$.routeName ? `Active: ` : ``}
			${link(routeName, `Go ${routeName}`)}
		</li>
	`)}
</ul>
`;
}
