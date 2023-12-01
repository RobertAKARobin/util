import { Route, router } from '@src/router.ts';

export default () => `
<ul>
	${Object.keys(router.routes).map(routeName => `
		<li>${
			new Route({
				to: routeName as keyof typeof router.routes,
			}).render(`Go ${routeName}`)
		}</li>
	`).join(``)}
</ul>
`;
