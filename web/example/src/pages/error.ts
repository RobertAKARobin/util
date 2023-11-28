import { Page } from '@robertakarobin/web/index.ts';

export default class ErrorPage extends Page {
	title = `Error 404`;
	template = () => `
<main>
	<h1>404 page :(</h1>
</main>`;
}
