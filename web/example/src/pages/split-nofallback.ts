import { Page } from '@robertakarobin/web/index.ts';

import nav from '../components/nav.ts';

export class SplitFallbackPage extends Page {
	doFallback = false;
	importMetaUrl = import.meta.url;
	title = `Split fallback`;
	template = () => `
		${nav()}
		<h1>Split fallback</h1>
	`;
}

export default Page.toFunction(SplitFallbackPage);
