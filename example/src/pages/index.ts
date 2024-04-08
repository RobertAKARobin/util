import { Component, css, html, Page } from '@robertakarobin/util/components/component.ts';
import { appContext } from '@robertakarobin/util/context.ts';
import { type EntityId } from '@robertakarobin/util/emitter/entities.ts';
import { ModalContainer } from '@robertakarobin/util/components/modal-container.ts';

import type * as Type from '@src/types.d.ts';
import { link } from '@src/components/link.ts';
import { List } from '@src/components/list.ts';
import { ListItem } from '@src/components/listitem.ts';
import { ProgressModal } from '@src/modals/progress.ts';
import { router } from '@src/app.ts';
import { state } from '@src/state.ts';
import { theme } from '@src/theme.ts';
import { TransitionTest } from '@src/components/transition-test.ts';

const style = css`
:host h1 {
	color: red;
}
`;

const colors = [`red`, `yellow`, `green`, `brown`, `scarlet`];

@Component.define({ style })
export class IndexPage extends Page {
	readonly list = this.findDown(List);
	readonly listItems = this.findDown(ListItem, { all: true });
	@Component.attribute({ name: `data-message` }) message!: string;

	anchorlessRoute() {
		router.go(`ssgYes`);
	}

	connectedCallback() {
		super.connectedCallback();

		if (appContext === `browser`) {
			for (const listItem of this.listItems()) {
				state.upsert(
					listItem.id,
					{ value: listItem.text },
				);
			}

			this.render(`._swapText`);
		}
	}

	onAdd() {
		state.add({ value: `` });
		this.list().setListItems(state.byIndex.$);
		this.list().render();
	}

	onDelete(event: CustomEvent<EntityId>) {
		const id = event.detail;
		state.remove(id);
		this.list().setListItems(state.byIndex.$);
		this.list().render();
	}

	onInput(event: CustomEvent<Type.ListItemWithId>) {
		state.update(event.detail.id, {
			value: event.detail.value,
		});
	}

	openModal() {
		void ModalContainer.find().place(new ProgressModal().render()).show();
	}

	template = () => html`
<h1>Hello world!</h1>

${new TransitionTest()}

<button
	${this.on(`click`, `openModal`)}
	type="button"
>Modal</button>

<div id="jump1">Jump 1</div>

${List.id(`indexList`)
	.setListItems(state.byIndex.$)
	.on(`onListAdd`, this, `onAdd`)
	.on(`onListDelete`, this, `onDelete`)
	.on(`onListInput`, this, `onInput`)
}

<div class="_swapText">
	${appContext === `build`
		? html`<h1>This should be in the source, not browser.</h1>`
		: html`<h1>This should be in the browser, not source.</h1>`
	}
</div>

<markdown>
# Headline 1

## ${this.message}

Lorem ipsum dolor <strong>sit amet</strong>, consectetur *adipiscing elit*, sed do _eiusmod tempor_ incididunt.

Duis aute voluptate [velit esse cillum](https://example.com) dolore /eu fugiat/ nulla pariatur.
</markdown>

<p>${link(`ssgYes`, `Link to SSG Yes`)}</p>

<p class="${theme.typeClassNames.wtf}">abc123</p>

<button ${this.on(`click`, `anchorlessRoute`)}><host type="button">Go to SSG Yes</host></button>

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
};
