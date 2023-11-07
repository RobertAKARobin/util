import { Page } from '@robertakarobin/web';

export class SplitPage extends Page {
	importMetaUrl = import.meta.url;
	title = `Split`;
	template() {
		return `<h1>Split</h1>`;
	}
}

export default Page.toFunction(SplitPage);
