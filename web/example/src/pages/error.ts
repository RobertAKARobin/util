import { Page } from '@robertakarobin/web/index.ts';

export class ErrorPage extends Page {
	title = `Error 404`;
	template = () => `
		<h1>404 page :(</h1>
	`;
}

export default Page.toFunction(ErrorPage);
