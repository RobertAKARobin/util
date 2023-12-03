import { Page } from '@robertakarobin/web/index.ts';

import { router, routes, RouteTo } from '@src/router.ts';
import { List } from '@src/components/list.ts';
import { state } from '@src/state.ts';

const style =  `
h1 {
	color: red;
}
`;

const colors = [`red`, `yellow`, `green`, `brown`, `scarlet`];

export class IndexPage extends Page {
	static style = style;

	message: string;
	title = `Home page`;

	constructor({ message, ...attributes }: {
		message?: string;
	}) {
		super(attributes);
		this.message = message ?? ``;
		// state.entries.subscribe(entries => {
		// 	const list = this.find(List);
		// 	list.items = entries;
		// 	list.rerender();
		// });
	}

	anchorlessRoute() {
		router.next(routes.ssgYes);
	}

	template = () => `
<div>
<h1>Hello world!</h1>

<div id="${routes.homeJump1.idAttr}">Jump 1</div>

<markdown>
# Headline 1

## ${this.message}

Lorem ipsum dolor <strong>sit amet</strong>, consectetur *adipiscing elit*, sed do _eiusmod tempor_ incididunt.

Duis aute voluptate [velit esse cillum](https://example.com) dolore /eu fugiat/ nulla pariatur.
</markdown>

<p>${new RouteTo(routes.home).render(`Link to homepage`)}</p>

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

<div id="${routes.homeJump2.idAttr}">Jump 2</div>
</div>`;
}
