import { routes, RouteTo } from '@src/router.ts';

export default () => `
<ul>
	${Object.entries(routes).map(([routeName, route]) => `
		<li>${
			new RouteTo(route).render(`Go ${routeName}`)
		}</li>
	`).join(``)}
</ul>
`;
