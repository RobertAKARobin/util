import { Page } from '@robertakarobin/web/index.ts';

const style = `
h1 {
	color: purple;
}
`;

export class YesSSGPage extends Page {
	static style = style;
	title = `SSG yes`;
	template = () => `
		<h1>SSG yes</h1>

		<div id="jump1">Jump 1</div>

		<div id="jump2">Jump 2</div>
	`;
}
