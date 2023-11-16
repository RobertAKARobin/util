import { Page } from '@robertakarobin/web/index.ts';

export class NoSSGPage extends Page {
	isSSG = false;
	title = `SSG no`;
	template = () => `
		<h1>SSG no</h1>
	`;
}
