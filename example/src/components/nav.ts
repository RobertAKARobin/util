import { Component, html } from '@robertakarobin/util/components/component.ts';

import { link } from '@src/components/link.ts';
import { router } from '@src/app.ts';

@Component.define({
	stylePath: import.meta.url,
})
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
