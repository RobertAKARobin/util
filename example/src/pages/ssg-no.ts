import { PageFactory } from '@robertakarobin/web/component.ts';

import { layout } from './_layout.ts';

export class NoSSGPage extends PageFactory(`main`) {
	static {
		this.init();
	}
	isSSG = false;
	template = () => layout(`
<h1>SSG no</h1>
`);
}
