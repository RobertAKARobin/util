import { BasePage } from './_page.ts';

export class ErrorPage extends BasePage {
	title = `Error 404`;
	template = () => super.template(`
	<main>
		<h1>404 page :(</h1>
	</main>
`);
}
