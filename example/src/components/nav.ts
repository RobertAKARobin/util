import { Component, html } from '@robertakarobin/util/util/components/component';

import { link } from '@src/components/link';
import { router } from '@src/app';

@Component.define({
	stylePath: import.meta.url,
})
export class Nav extends Component.custom(`nav`) {
	override template = () => html`
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
