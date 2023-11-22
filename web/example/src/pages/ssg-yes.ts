import { Page } from '@robertakarobin/web/index.ts';

import { router } from '../router.ts';

const style = `
h1 {
	color: purple;
}
`;

export class YesSSGPage extends Page {
	static style = style;
	title = `SSG yes`;
	template = () => `
		<h1>SSG yes</h1>

		<div id="${router.routes.ssgYesJump1.hash.substring(1)}">Jump 1</div>

		<div id="${router.routes.ssgYesJump2.hash.substring(1)}">Jump 2</div>
	`;
}

export default Page.register(YesSSGPage);
