import { Page } from '@robertakarobin/web/index.ts';

export class BundledFallbackPage extends Page {
	title = `Bundled fallback`;
	template() {
		return `<h1>Bundled fallback</h1>`;
	}
}

export default Page.toFunction(BundledFallbackPage);
