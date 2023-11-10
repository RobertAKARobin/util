import { Page } from '@robertakarobin/web/index.ts';

import textbox from '../components/textbox.ts';

const style =  `
h1 {
	color: red;
}
`;

const template = (message: string) => `
<h1>Hello world!</h1>

<markdown>
# Headline 1 ${message}

## ${message}

${textbox()}

${textbox()}`;

export class IndexPage extends Page {
	splitImportMetaUrl = import.meta.url;
	style = style;
	template = template;
	title = `Home page`;
}

export default Page.toFunction(IndexPage);
