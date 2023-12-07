import { Page } from '@robertakarobin/util/component.ts';

export class NoSSGPage extends Page {
	isSSG = false;
	title = `SSG no`;
	template = () => `
<div>
	<h1>SSG no</h1>
</div>`;
}
