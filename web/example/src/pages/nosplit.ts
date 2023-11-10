import { Page } from '@robertakarobin/web/index.ts';

export class BundledPage extends Page {
	doSplit = false;
	importMetaUrl = import.meta.url;
	title = `Nosplit`;
	template() {
		return `<h1>Nosplit</h1>`;
	}
}

export default Page.toFunction(BundledPage);
