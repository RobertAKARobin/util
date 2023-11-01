import { link, page } from '@robertakarobin/web';

import { routes } from '../routes.ts';

import { staticLayout } from './_staticLayout.ts';

export const template = () => `
<h1>404 page :(</h1>

<p>${link({ content: `Go home`, href: routes.home })}</p>
`;

export const errorPage = page(`Error 404`, staticLayout, template);
