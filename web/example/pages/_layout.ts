import { link } from '@robertakarobin/web';

import { routes } from '../routes.ts';

export default (title: string, contents: string) => `
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>${title}</title>
		<base href="/" />
		<script src="/web.js" type="module"></script>
		<script src="/script.js" type="module"></script>
		<link rel="stylesheet" href="/styles.css" />
	</head>
	<body>
		<div
			class="view"
			id="output"
		>${contents}</div>

		<nav>
			<ul>
			${Object.keys(routes).map(route =>
				`<li>
					${link({
						content: `Go ${routes[route]}`,
						href: routes[route],
					})}
				</li>`
			).join(``)}
			</ul>
		</nav>
	</body>
</html>
`;
