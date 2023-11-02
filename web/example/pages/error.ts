import { link, routes } from '../routes.ts';

export default () => `
<h1>404 page :(</h1>

<p>${link({ content: `Go home`, href: routes.home })}</p>
`;
