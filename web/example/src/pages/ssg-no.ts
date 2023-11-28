import { Page } from '@robertakarobin/web/index.ts';

export default class NoSSGPage extends Page {
	isSSG = false;
	title = `SSG no`;
	template = () => `
<main>
	<h1>SSG no</h1>
</main>`;
}
