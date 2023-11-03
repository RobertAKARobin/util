import { page } from '@robertakarobin/web';

import { link, routes } from '../routes.ts';

export const style = `
h1 {
	color: red;
}
`;

export const template = () => `
<h1>Hello world!</h1>

<p>${link({ content: `Oh no`, href: routes.error404 })}</p>
`;

export default page({
	importMetaUrl: import.meta.url,
	style,
	template,
	title: `Home page`,
});
