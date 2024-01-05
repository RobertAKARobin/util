import { html } from '@robertakarobin/web/component.ts';
import { router } from '@src/router.ts';

export const Nav = () => html`
<nav>
	<ul>
		${router.routeNames.map(routeName => `
			<li>${router.link(routeName, `Go ${routeName}`)}</li>
		`)}
	</ul>
</nav>
`;
