import { Page } from '@robertakarobin/web/index.ts';

const style = `
h1 {
	color: purple;
}
`;

export class NoSSGPage extends Page {
	static style = style;
	title = `SSG yes`;
	template = () => `
		<h1>SSG yes</h1>
	`;
}

export default Page.toFunction(NoSSGPage);
