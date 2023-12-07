import { Page } from '@robertakarobin/web/component.ts';

export class ErrorPage extends Page {
	title = `Error 404`;
	template = () => `
<div>
	<h1>404 page :(</h1>
</div>`;
}
