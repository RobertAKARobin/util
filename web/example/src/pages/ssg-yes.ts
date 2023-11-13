import { Page } from '@robertakarobin/web/index.ts';

export class NoSSGPage extends Page {
	importMetaUrl = import.meta.url;
	title = `SSG yes`;
	template = () => `
		<h1>SSG yes</h1>
	`;
}

export default Page.toFunction(NoSSGPage);
