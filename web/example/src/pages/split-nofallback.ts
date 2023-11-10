import { Page } from '@robertakarobin/web/index.ts';

export class SplitFallbackPage extends Page {
	doFallback = false;
	importMetaUrl = import.meta.url;
	title = `Split fallback`;
	template() {
		return `<h1>Split fallback</h1>`;
	}
}

export default Page.toFunction(SplitFallbackPage);
