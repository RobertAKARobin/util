import { Component, css, html, Page } from '@robertakarobin/util/components/component.ts';
import { appContext } from '@robertakarobin/util/web/context.ts';
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
:host {
	h1 {
		color: red;
	}
}
`;

@Component.define({
	style,
	stylePath: import.meta.url,
})
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

<p>${link(`ssgYes`, `Link to SSG Yes`)}</p>

<p class="${theme.typeClassNames.wtf}">abc123</p>

<button ${this.on(`click`, `anchorlessRoute`)}><host type="button">Go to SSG Yes</host></button>

<div id="jump2">Jump 2</div>

<div class="_bounce"></div>
`;
};
