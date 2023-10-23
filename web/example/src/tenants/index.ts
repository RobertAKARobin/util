import { component } from '@robertakarobin/web/index.ts';

import { route } from '../../routes.ts';

const template = () => `
<h1>Tenants</h1>

${route(`splash`, `Home`)}
`;

export const tenantsPage = component({ template });
