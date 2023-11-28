import { Page } from '@robertakarobin/web/index.ts';

import { router } from '../router.ts';

const style = `
h1 {
	color: purple;
}
`;

export default class YesSSGPage extends Page {
	static style = style;
	title = `SSG yes`;
	template = () => `
<div>
	<h1>SSG yes</h1>

	<div id="${router.routes.ssgYesJump1.hash.substring(1)}">Jump 1</div>

	<div id="${router.routes.ssgYesJump2.hash.substring(1)}">Jump 2</div>
</div>`;
}
