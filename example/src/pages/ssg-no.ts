import { Page } from '@robertakarobin/web/component.ts';

export class NoSSGPage extends Page(`div`) {
	static {
		this.init();
	}
	isSSG = false;
	template = () => `
<main>
	<h1>SSG no</h1>
</main>
`;
}
