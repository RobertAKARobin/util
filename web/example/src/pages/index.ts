import { Page } from '@robertakarobin/web/index.ts';

import { route, router } from '../router.ts';
import listItem from '../components/listitem.ts';
import { state } from '../state.ts';

const style =  `
h1 {
	color: red;
}
`;

const colors = [`red`, `yellow`, `green`, `brown`, `scarlet`];

export default class IndexPage extends Page {
	static style = style;

	listItemsById = state.pipe(({ listItems }) => {
		type ListItem = typeof listItems[number];
		return listItems.reduce((listItems, listItem, index) => {
			listItems[listItem.uid] = {
				...listItem,
				index,
			};
			return listItems;
		}, {} as Record<ListItem[`uid`], ListItem & { index: number; }>);
	});

	title = `Home page`;

	accept(input: {
		message: string;
	}) {
		state.subscribe((newState, oldState) => {
			console.log(newState, oldState);
		});

		return {
			message: input.message ?? ``,
		};
	}

	template = () => `
<div>
<h1>Hello world!</h1>

<div id="${router.routes.homeJump1.hash.substring(1)}">Jump 1</div>

<ol>
	${state.last.listItems.map(item => `
		<li>${listItem(item.uid).set(item).render()}</li>
	`).join(`\n`)}
</ol>

<markdown>
# Headline 1

## ${this.$.message}

Lorem ipsum dolor <strong>sit amet</strong>, consectetur *adipiscing elit*, sed do _eiusmod tempor_ incididunt.

Duis aute voluptate [velit esse cillum](https://example.com) dolore /eu fugiat/ nulla pariatur.
</markdown>

<p>${route().set({ to: `home` }).render(`Link to homepage`)}</p>

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
