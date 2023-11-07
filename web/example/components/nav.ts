import route from './route.ts';
import { routes } from '../routes.ts';

const routeNames = Object.keys(routes) as Array<keyof typeof routes>;

export default () => `
	<ul>
	${routeNames.map(routeName =>
		`<li>
			${route(routeName, `Go ${routes[routeName]}`)}
		</li>`
	).join(``)}
	</ul>
`;
