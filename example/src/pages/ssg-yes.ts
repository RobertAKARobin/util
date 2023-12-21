import { Page } from '@robertakarobin/web/component.ts';

import { layout } from './_layout.ts';
import { router } from '@src/router.ts';

const style = `
h1 {
	color: purple;
}
`;

export class YesSSGPage extends Page(`div`) {
	static style = style;
	static {
		this.init();
	}
	isSSG = true;
	template = () => layout(`
<main>
	<h1>SSG yes</h1>

	<div id="${router.hashes.ssgYesJump1}">Jump 1</div>

	<div id="${router.hashes.ssgYesJump2}">Jump 2</div>
</main>
`);
}
