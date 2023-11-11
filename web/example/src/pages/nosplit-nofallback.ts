import { Page } from '@robertakarobin/web/index.ts';

import nav from '../components/nav.ts';

export class BundledFallbackPage extends Page {
	doFallback = false;
	doSplit = false;
	importMetaUrl = import.meta.url;
	title = `Nosplit fallback`;
	template = () => `
		${nav()}
		<h1>Nosplit fallback</h1>
	`;
}

export default Page.toFunction(BundledFallbackPage);
