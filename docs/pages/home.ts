import { bind, component } from '@robertakarobin/web/index.ts';
import { image } from '@robertakarobin/web/components/image.ts';

import { link, routes } from '../routes.ts';

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
		${link({ content: `Home`, href: routes.home })}
	</nav>

	${image({
		alt: `ayy`,
		src: `/assets/200.jpg`,
	})}

	<button onclick=${bind(greet, `Steve`)}>Greet</button>
</div>
`;

export const homePage = component({
	style,
	template,
});
