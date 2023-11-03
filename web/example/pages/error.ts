import { link, routes } from '../routes.ts';
import { page } from '@robertakarobin/web';

export const template = () => `
<h1>404 page :(</h1>

<p>${link({ content: `Go home`, href: routes.home })}</p>
`;

export default page({
	template,
	title: `Error 404`,
});
