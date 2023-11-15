import { Page } from '@robertakarobin/web/index.ts';

import textbox from '../components/textbox.ts';

const style =  `
h1 {
	color: red;
}
`;

const colors = [`red`, `yellow`, `green`, `brown`, `scarlet`];

const template = (message: string) => `
<h1>Hello world!</h1>

<div id="jump1">Jump 1</div>

<markdown>
# Headline 1

## ${message}

<div>${textbox()}</div>

<div>${textbox()}</div>

Lorem ipsum dolor <strong>sit amet</strong>, consectetur *adipiscing elit*, sed do _eiusmod tempor_ incididunt.

Duis aute voluptate [velit esse cillum](https://example.com) dolore /eu fugiat/ nulla pariatur.
</markdown>

<markdown>
## Headline 2

> Excepteur sint ${`occaecat <markdown>*cupidatat*</markdown> non`} proident.

Joseph's coat was ${colors.join(` and `)}.

-	ut aliquip ex
-	ea commodo consequat.
	-	Duis aute
	-	irure dolor in
-	ut aliquip ex

1.	ut aliquip ex
1.	ea commodo consequat.
	1.	Duis aute
	1.	irure dolor in
1.	ut aliquip ex
</markdown>

<div id="jump2">Jump 2</div>
`;

export class IndexPage extends Page {
	static style = style;
	template = template;
	title = `Home page`;
}

export default Page.toFunction(IndexPage);
