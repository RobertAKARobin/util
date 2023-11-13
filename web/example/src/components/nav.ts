import { app } from '../app.ts';
import route from './route.ts';

const routeNames = Object.keys(app.routes) as Array<keyof typeof app.routes>;

export default () => `
	<ul>
	${routeNames.map(routeName =>
		`<li>
			${route(routeName, `Go ${app.routes[routeName]}`)}
		</li>`
	).join(``)}
	</ul>
`;
