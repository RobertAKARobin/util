import { Page } from '@robertakarobin/web/index.ts';

import { route, router } from '@src/router.ts';
import listItem from '@src/components/listitem.ts';
import { state } from '@src/state.ts';

const style =  `
h1 {
	color: red;
}
`;

const colors = [`red`, `yellow`, `green`, `brown`, `scarlet`];

export default class IndexPage extends Page<IndexPage> {
	static style = style;

	title = `Home page`;

	accept(input: {
		message: string;
	}) {
		return {
			message: input.message ?? ``,
		};
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

<ol>
	${state.entries.last.map(({ id, value }) => `
		<li>${listItem(id).set({ value }).render()}</li>
	`).join(`\n`)}

	<li><button type="button" onclick=${this.bind(`addListItem`)}>Add</button></li>
</ol>

<markdown>
# Headline 1

## ${this.$.message}

Lorem ipsum dolor <strong>sit amet</strong>, consectetur *adipiscing elit*, sed do _eiusmod tempor_ incididunt.

Duis aute voluptate [velit esse cillum](https://example.com) dolore /eu fugiat/ nulla pariatur.
</markdown>

<p>${route().set({ to: `home` }).render(`Link to homepage`)}</p>

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
