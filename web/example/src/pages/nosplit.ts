import { Page } from '@robertakarobin/web/index.ts';

export class BundledPage extends Page {
	splitImportMetaUrl = null;
	title = `Bundled`;
	template() {
		return `<h1>Bundled</h1>`;
	}
}

export default Page.toFunction(BundledPage);
