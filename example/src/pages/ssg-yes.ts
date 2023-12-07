import { Page } from '@robertakarobin/web/component.ts';

import { routes } from '@src/router.ts';

const style = `
h1 {
	color: purple;
}
`;

export class YesSSGPage extends Page {
	static style = style;

	isSSG = true;
	template = () => `
<div>
	<h1>SSG yes</h1>

	<div id="${routes.ssgYesJump1.idAttr}">Jump 1</div>

	<div id="${routes.ssgYesJump2.idAttr}">Jump 2</div>
</div>`;
}
