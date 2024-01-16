import { router } from '@src/app.ts';

export const Nav = () => /*html*/`
<nav>
	<ul>
		${router.routeNames.map(routeName => `
			<li>${router.link(routeName, `Go ${routeName}`)}</li>
		`).join(``)}
	</ul>
</nav>
`;
