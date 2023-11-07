import { Page } from '@robertakarobin/web';

export class SplitFallbackPage extends Page {
	importMetaUrl = import.meta.url;
	title = `Split fallback`;
	template() {
		return `<h1>Split fallback</h1>`;
	}
}

export default Page.toFunction(SplitFallbackPage);
