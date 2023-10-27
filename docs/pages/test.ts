import { component } from '@robertakarobin/web/index.ts';

import { link, routes } from '../routes.ts';

const template = () => `
<h1>Test page</h1>

<p>${link({ content: `Return`, href: routes.home })}</p>
`;

export const test = component({ template });
