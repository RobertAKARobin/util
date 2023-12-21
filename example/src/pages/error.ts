import { Page } from '@robertakarobin/web/component.ts';

export class ErrorPage extends Page(`div`) {
	static {
		this.init();
	}

	template = () => `
	<main>
		<h1>404 page :(</h1>
	</main>
`;
}
