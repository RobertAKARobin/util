import { Page } from '@robertakarobin/web';

import textbox from '../components/textbox.ts';

export class IndexPage extends Page {
	importMetaUrl = import.meta.url;

	style = `
	h1 {
		color: red;
	}
	`;

	title = `Home page`;

	template() {
		return `
		<h1>Hello world!</h1>

		${textbox()}

		${textbox()}
		`;
	}
}

export default Page.toFunction(IndexPage);
