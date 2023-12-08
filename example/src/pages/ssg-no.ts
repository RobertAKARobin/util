import { BasePage } from './_page.ts';

export class NoSSGPage extends BasePage {
	isSSG = false;
	title = `SSG no`;
	template = () => super.template(`
<main>
	<h1>SSG no</h1>
</main>
`);
}
