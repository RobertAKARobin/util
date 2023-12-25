import { PageFactory } from '@robertakarobin/web/component.ts';

import { layout } from './_layout.ts';

export class NoSSGPage extends PageFactory(`div`) {
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
