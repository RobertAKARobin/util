import { routes, RouteTo } from '@src/router.ts';

export const nav = () => `
<ul>
	${Object.entries(routes).map(([routeName, route]) => `
		<li>${
			new RouteTo(route).render(`Go ${routeName}`)
		}</li>
	`).join(``)}
</ul>
`;
