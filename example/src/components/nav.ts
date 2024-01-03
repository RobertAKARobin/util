import { Link, routeNames } from '@src/router.ts';

export const Nav = () => `
<nav>
	<ul>
		${routeNames.map(routeName => `
			<li>${Link(routeName, `Go ${routeName}`)}</li>
		`).join(``)}
	</ul>
</nav>
`;
