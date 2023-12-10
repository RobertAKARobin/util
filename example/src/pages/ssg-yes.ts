import { BasePage } from './_page.ts';

import { router } from '@src/router.ts';

const style = `
h1 {
	color: purple;
}
`;

export class YesSSGPage extends BasePage {
	static style = style;

	isSSG = true;
	template = () => super.template(`
<main>
	<h1>SSG yes</h1>

	<div id="${router.hashes.ssgYesJump1}">Jump 1</div>

	<div id="${router.hashes.ssgYesJump2}">Jump 2</div>
</main>
`);
}
