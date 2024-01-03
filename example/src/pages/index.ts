import { Component } from '@robertakarobin/web/component.ts';

import { Link, router } from '@src/router.ts';
import { Layout } from './_layout.ts';
import { List } from '@src/components/list.ts';
import { ListItem } from '@src/components/listitem.ts';

import { modalContainer } from '@src/modals/_container.ts';
import { ProgressModal } from '@src/modals/progress.ts';
import { state } from '@src/state.ts';
import { TransitionTest } from '@src/components/transition-test.ts';

const style =  `
:host h1 {
	color: red;
}
`;

const colors = [`red`, `yellow`, `green`, `brown`, `scarlet`];

@Component.define()
export class IndexPage extends Layout {
	static style = style;

	@Component.attribute() message = ``;

	anchorlessRoute() {
		router.to(`ssgYes`);
	}

	onPlace() {
		const $list = this.findDown(List);
		const $listItems = $list.findDownAll(ListItem);
		for (const $listItem of $listItems) {
			state.upsert(
				$listItem.id,
				{ value: $listItem.value },
			);
		}

		$list.on(`onAdd`, () => {
			state.add({ value: `` });
			$list.setListItems(state.entries.$);
			$list.render();
		});
	}

	openModal() {
		modalContainer.place(new ProgressModal());
	}

	template = () => super.template(`
<h1>Hello world!</h1>

${new TransitionTest()}

<button
	onclick="${this.bind(`openModal`)}"
	type="button"
>Modal</button>

<div id="${router.hashes.homeJump1}">Jump 1</div>

${new List().setListItems(state.entries.$)}

<markdown>
# Headline 1

## ${this.message}

Lorem ipsum dolor <strong>sit amet</strong>, consectetur *adipiscing elit*, sed do _eiusmod tempor_ incididunt.

Duis aute voluptate [velit esse cillum](https://example.com) dolore /eu fugiat/ nulla pariatur.
</markdown>

<p>${Link(`ssgYes`, `Link to SSG Yes`)}</p>

<button type="button" onclick="${this.bind(`anchorlessRoute`)}">Go to SSG Yes</button>

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

<div id="${router.hashes.homeJump2}">Jump 2</div>
`);
};
