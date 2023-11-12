import { Page } from '@robertakarobin/web/index.ts';

import nav from '../components/nav.ts';

export class NoSSGPage extends Page {
	importMetaUrl = import.meta.url;
	title = `SSG yes`;
	template = () => `
		${nav()}
		<h1>SSG yes</h1>
	`;
}

export default Page.toFunction(NoSSGPage);
