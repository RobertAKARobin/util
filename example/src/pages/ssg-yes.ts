import { Component } from '@robertakarobin/web/component.ts';

import { Layout } from './_layout.ts';
import { router } from '@src/app.ts';

const style = `
h1 {
	color: purple;
}
`;

@Component.define({ style })
export class YesSSGPage extends Layout {
	isSSG = true;
	template = () => super.template(/*html*/`
<h1>SSG yes</h1>

<div id="${router.hashes.ssgYesJump1}">Jump 1</div>

<div id="${router.hashes.ssgYesJump2}">Jump 2</div>
`);
}
