import { component } from '@robertakarobin/web/component.ts';
import { image } from '@robertakarobin/web/components/image.ts';
import { route } from '@robertakarobin/web/components/route.ts';

import { bind } from '../../cache.ts';
import { routes } from '../../routes.ts';

function greet(this: HTMLElement, event: MouseEvent, name: string) {
	console.log(this);
	console.log(event);
	console.log(`Hello ${name}`);
}

const style = `
nav {
	color: red;
}
`;

const template = () => `
<div>
	<nav>
		${route({ to: routes.splash }, `Home`)}
		${route({ to: routes.tenants }, `Tenants`)}
	</nav>

	${image({
		alt: `ayy`,
		src: `http://http.cat/200`,
	})}

	<button onclick=${bind(greet, `Steve`)}>Greet</button>
</div>
`;

export const splashPage = component({
	style,
	template,
});
