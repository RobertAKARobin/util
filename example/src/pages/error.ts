import { Component } from '@robertakarobin/web/component.ts';

import { Layout } from './_layout.ts';

@Component.define()
export class ErrorPage extends Layout {
	template = () => super.template(`
<h1>404 page :(</h1>
`);
}
