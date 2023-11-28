import { route, router } from '../router.ts';

export default () => `
<ul>
	${Object.keys(router.routes).map(routeName => `
		<li>${route({ to: routeName as keyof typeof router.routes }).render(`Go ${routeName}`)}</li>
	`).join(``)}
</ul>
`;
