import { link, routes } from '../routes.ts';

export default () => `
	<ul>
	${Object.keys(routes).map(route =>
		`<li>
			${link({
				content: `Go ${routes[route as keyof typeof routes]}`,
				href: routes[route as keyof typeof routes],
			})}
		</li>`
	).join(``)}
	</ul>
`;
