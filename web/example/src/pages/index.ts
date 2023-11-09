import { Page } from '@robertakarobin/web/index.ts';

import textbox from '../components/textbox.ts';

const style =  `
h1 {
	color: red;
}
`;

const template = (message: string) => `
<h1>Hello world! ${message}</h1>

${textbox()}

${textbox()}
`;

export class IndexPage extends Page {
	importMetaUrl = import.meta.url;
	style = style;
	template = template;
	title = `Home page`;
}

export default Page.toFunction(IndexPage);
