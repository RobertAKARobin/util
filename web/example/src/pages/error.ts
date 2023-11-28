import { Page } from '@robertakarobin/web/index.ts';

export default class ErrorPage extends Page {
	title = `Error 404`;
	template = () => `
<div>
	<h1>404 page :(</h1>
</div>`;
}
