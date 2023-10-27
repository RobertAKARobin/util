import { component } from '@robertakarobin/web/index.ts';

import { link, routes } from '../routes.ts';

const template = () => `
<h1>404 page :(</h1>

<p>${link({ content: `Go home`, href: routes.home })}</p>
`;

export const error404 = component({ template });
