import { Page } from '@robertakarobin/web/index.ts';

export class ErrorPage extends Page {
	importMetaUrl = import.meta.url;
	title = `Error 404`;
	template() {
		return `
		<h1>404 page :(</h1>
		`;
	}
}

export default Page.toFunction(ErrorPage);