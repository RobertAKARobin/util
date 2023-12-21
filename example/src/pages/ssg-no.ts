import { Page } from '@robertakarobin/web/component.ts';

import { layout } from './_layout.ts';

export class NoSSGPage extends Page(`div`) {
	static {
		this.init();
	}
	isSSG = false;
	template = () => layout(`
<main>
	<h1>SSG no</h1>
</main>
`);
}
