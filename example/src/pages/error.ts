import { Page } from '@robertakarobin/web/component.ts';

import { layout } from './_layout.ts';

export class ErrorPage extends Page(`div`) {
	static {
		this.init();
	}

	template = () => layout(`
	<main>
		<h1>404 page :(</h1>
	</main>
`);
}
