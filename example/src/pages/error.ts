import { Page } from '@robertakarobin/web/component.ts';

import { Layout } from './_layout.ts';

export class ErrorPage extends Layout {
	template = () => super.template(`
<h1>404 page :(</h1>
`);
}

export const errorPage = Page.init(ErrorPage);
