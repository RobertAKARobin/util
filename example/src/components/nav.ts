import { router } from '@src/router.ts';

export const Nav = () => `
<nav>
	<ul>
		${router.routeNames.map(routeName => `
			<li>${router.link(routeName, `Go ${routeName}`)}</li>
		`).join(``)}
	</ul>
</nav>
`;
