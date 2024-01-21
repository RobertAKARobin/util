import { Component, Page } from '@robertakarobin/util/component.ts';
import { appContext } from '@robertakarobin/util/context.ts';

import { List } from '@src/components/list.ts';
import { ListItem } from '@src/components/listitem.ts';
import { modalContainer } from '@src/app.ts';
import { ProgressModal } from '@src/modals/progress.ts';
import { router } from '@src/app.ts';
import { state } from '@src/state.ts';
import { TransitionTest } from '@src/components/transition-test.ts';

const style = /*css*/`
:host h1 {
	color: red;
}
`;

const colors = [`red`, `yellow`, `green`, `brown`, `scarlet`];

@Component.define({ style })
export class IndexPage extends Page {
	@Component.attribute({ name: `data-message` }) message!: string;

	anchorlessRoute() {
		router.to(`ssgYes`);
	}

	connectedCallback() {
		const list = List.find();
		const listItems = list.findDownAll(ListItem);
		for (const listItem of listItems) {
			state.upsert(
				listItem.id,
				{ value: listItem.text },
			);
		}
	}

	onAdd() {
		state.add({ value: `` });
		const list = this.findDown(List);
		list.setListItems(state.entries.$);
		list.render({ force: true });
	}

	onDelete(id: string) {
		state.remove(id);
		const list = this.findDown(List);
		list.setListItems(state.entries.$);
		list.render({ force: true });
	}

	openModal() {
		modalContainer.place(new ProgressModal());
	}

	template = () => /*html*/`
<h1>Hello world!</h1>

${new TransitionTest()}

<button
	onclick="${this.bind(`openModal`)}"
	type="button"
>Modal</button>

<div id="${router.hashes.homeJump1}">Jump 1</div>

${new List()
	.setListItems(state.entries.$)
	.on(`onAdd`, () => this.onAdd())
	.on(`onDelete`, event => this.onDelete(event.detail))
	.on(`onInput`, event => state.update(event.detail.id, event.detail))
}

${appContext === `build`
	? /*html*/`<h1>This should be in the source, not browser.</h1>`
	: /*html*/`<h1>This should be in the browser, not source.</h1>`
}

<markdown>
# Headline 1

## ${this.message}

Lorem ipsum dolor <strong>sit amet</strong>, consectetur *adipiscing elit*, sed do _eiusmod tempor_ incididunt.

Duis aute voluptate [velit esse cillum](https://example.com) dolore /eu fugiat/ nulla pariatur.
</markdown>

<p>${router.link(`ssgYes`, `Link to SSG Yes`)}</p>

<button onclick="${this.bind(`anchorlessRoute`)}"><host type="button">Go to SSG Yes</host></button>

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
`;
};
