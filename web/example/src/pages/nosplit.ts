import { Page } from '@robertakarobin/web/index.ts';

import nav from '../components/nav.ts';

export class BundledPage extends Page {
	doSplit = false;
	importMetaUrl = import.meta.url;
	title = `Nosplit`;
	template = () => `
		${nav()}
		<h1>Nosplit</h1>
	`;
}

export default Page.toFunction(BundledPage);
