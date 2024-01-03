import { Component } from '@robertakarobin/web/component.ts';

import { Layout } from './_layout.ts';

@Component.define()
export class NoSSGPage extends Layout {
	isSSG = false;
	template = () => super.template(`
<h1>SSG no</h1>
`);
}
