import { Page } from '@robertakarobin/web/index.ts';

import nav from '../components/nav.ts';

export class ErrorPage extends Page {
	importMetaUrl = import.meta.url;
	title = `Error 404`;
	template() {
		return `
		${nav()}

		<h1>404 page :(</h1>
		`;
	}
}

export default Page.toFunction(ErrorPage);
