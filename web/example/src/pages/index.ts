import { Page } from '@robertakarobin/web/index.ts';

import { route, router } from '@src/router.ts';
import list from '@src/components/list.ts';
import { state } from '@src/state.ts';

const style =  `
h1 {
	color: red;
}
`;

const colors = [`red`, `yellow`, `green`, `brown`, `scarlet`];

export default class IndexPage extends Page<IndexPage> {
	static style = style;

	message: string;
	title = `Home page`;

	constructor({ message, ...attributes }: {
		message?: string;
	}) {
		super(attributes);
		this.message = message ?? ``;
	}

	addListItem() {
		state.add({ value: `` });
		this.rerender();
	}

	anchorlessRoute() {
		router.to(`ssgYes`);
	}

	template = () => `
<div>
<h1>Hello world!</h1>

<div id="${router.routes.homeJump1.hash.substring(1)}">Jump 1</div>

${list({ items: state.entries.last }).render()}

<markdown>
# Headline 1

## ${this.message}

Lorem ipsum dolor <strong>sit amet</strong>, consectetur *adipiscing elit*, sed do _eiusmod tempor_ incididunt.

Duis aute voluptate [velit esse cillum](https://example.com) dolore /eu fugiat/ nulla pariatur.
</markdown>

<p>${route({ to: `home` }).render(`Link to homepage`)}</p>
<p>${route({ to: `error404` }).render(`Link to error`)}</p>

<button type="button" onclick=${this.bind(`anchorlessRoute`)}>Go to SSG Yes</button>

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

<div id="${router.routes.homeJump2.hash.substring(1)}">Jump 2</div>
</div>`;
}
