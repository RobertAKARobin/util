import { PageFactory } from '@robertakarobin/web/component.ts';

import { layout } from './_layout.ts';

export class ErrorPage extends PageFactory(`div`) {
	static {
		this.init();
	}

	template = () => layout(`
	<main>
		<h1>404 page :(</h1>
	</main>
`);
}
