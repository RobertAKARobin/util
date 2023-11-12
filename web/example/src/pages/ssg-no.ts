import { Page } from '@robertakarobin/web/index.ts';

import nav from '../components/nav.ts';

export class NoSSGPage extends Page {
	importMetaUrl = import.meta.url;
	isSSG = false;
	title = `SSG no`;
	template = () => `
		${nav()}
		<h1>SSG no</h1>
	`;
}

export default Page.toFunction(NoSSGPage);
