import { component } from '@robertakarobin/web/index.ts';
import { route } from '@robertakarobin/web/components/route.ts';

import { routes } from '../../routes.ts';

const template = () => `
<h1>Tenants</h1>

${route({ to: routes.home }, `Home`)}
`;

export const error404 = component({ template });
