import { Component } from '@robertakarobin/web/component.ts';
import { Image } from '@robertakarobin/web/components/image.ts';
import { Route } from '@robertakarobin/web/components/route.ts';

import { bind } from '../../cache.ts';
import { routes } from '../../routes.ts';

function greet(this: HTMLElement, event: MouseEvent, name: string) {
	console.log(this);
	console.log(event);
	console.log(`Hello ${name}`);
}

export class SplashPage extends Component {
	style = `
h1 {
	color: red;
}
	`;

	template = () => `
<div>
	<nav>
		${Route({ to: routes.splash }, `
			Home
		`)}
	</nav>

	${Image({
		alt: `ayy`,
		src: `http://http.cat/200`,
	})}

	<button onclick=${bind(greet, `Steve`)}>Greet</button>
</div>
	`;
}
