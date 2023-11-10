import { Page } from '@robertakarobin/web/index.ts';

export class BundledFallbackPage extends Page {
	doFallback = false;
	doSplit = false;
	importMetaUrl = import.meta.url;
	title = `Nosplit fallback`;
	template() {
		return `<h1>Nosplit fallback</h1>`;
	}
}

export default Page.toFunction(BundledFallbackPage);
