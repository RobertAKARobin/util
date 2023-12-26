import { PageFactory } from '@robertakarobin/web/component.ts';

import { layout } from './_layout.ts';

export class ErrorPage extends PageFactory(`main`) {
	static {
		this.init();
	}

	template = () => layout(`
<h1>404 page :(</h1>
`);
}
