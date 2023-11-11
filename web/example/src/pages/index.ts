import { Page } from '@robertakarobin/web/index.ts';

import nav from '../components/nav.ts';
import textbox from '../components/textbox.ts';

const style =  `
h1 {
	color: red;
}
`;

const colors = [`red`, `yellow`, `green`, `brown`, `scarlet`];

const template = (message: string) => `
${nav()}
<h1>Hello world!</h1>

<h1>Headline 1</h1>
<h2>${message}</h2>
<div>${textbox()}</div>

<div>${textbox()}</div>

<p>Lorem ipsum dolor <strong>sit amet</strong>, consectetur <em>adipiscing elit</em>, sed do <em>eiusmod tempor</em> incididunt.</p>
<p>Duis aute voluptate <a href="https://example.com">velit esse cillum</a> dolore /eu fugiat/ nulla pariatur.</p>


<h2>Headline 2</h2>
<blockquote>
<p>Excepteur sint ${`occaecat cupidatat non`} proident.</p>
</blockquote>
<p>Joseph&#39;s coat was ${colors.join(` and `)}.</p>
<ul>
<li>   ut aliquip ex</li>
<li>   ea commodo consequat.<ul>
<li>   Duis aute</li>
<li>   irure dolor in</li>
</ul>
</li>
<li>   ut aliquip ex</li>
</ul>
<ol>
<li>   ut aliquip ex</li>
<li>   ea commodo consequat.<ol>
<li>   Duis aute</li>
<li>   irure dolor in</li>
</ol>
</li>
<li>   ut aliquip ex</li>
</ol>

`;

export class IndexPage extends Page {
	importMetaUrl = import.meta.url;
	style = style;
	template = template;
	title = `Home page`;
}

export default Page.toFunction(IndexPage);
