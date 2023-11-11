import { Page } from '@robertakarobin/web/index.ts';

import nav from '../components/nav.ts';

export class SplitPage extends Page {
	importMetaUrl = import.meta.url;
	title = `Split`;
	template = () => `
		${nav()}
		<h1>Split</h1>
	`;
}

export default Page.toFunction(SplitPage);
