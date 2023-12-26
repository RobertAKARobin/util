import { ComponentFactory } from '@robertakarobin/web/component.ts';

import { Link, routeNames } from '@src/router.ts';

export class Nav extends ComponentFactory(`nav`) {
	static {
		this.init();
	}

	template = () => `
<ul>
	${routeNames.map(routeName => `
		<li>${Link.to(routeName, `Go ${routeName}`)}</li>
	`).join(``)}
</ul>
	`;
}
