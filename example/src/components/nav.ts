import { router } from '@src/app.ts';

export const Nav = () => /*html*/`
<nav>
	<ul>
		${router.routeNames.map(routeName => /*html*/`
			<li id="nav-${routeName}">
				${routeName === router.findCurrentRouteName() ? `Active: ` : ``}
				${router.link(routeName, `Go ${routeName}`)}
			</li>
		`).join(``)}
	</ul>
</nav>
`;
