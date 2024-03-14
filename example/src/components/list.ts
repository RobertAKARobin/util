import { Component, html } from '@robertakarobin/util/components/component.ts';
import { type EntityId } from '@robertakarobin/util/emitter/entities.ts';

import type * as Type from '@src/types.js';
import { ListItem } from './listitem.ts';

@Component.define()
export class List extends Component.custom(`ol`) {
	listItems = [] as Array<Type.ListItemWithId>;

	@Component.event()
	onAdd() {}

	@Component.event()
	onDelete(event: CustomEvent, id: EntityId) {
		return id;
	}

	@Component.event()
	onInput(event: CustomEvent<string>, id: EntityId) {
		return {
			id,
			value: event.detail,
		};
	}

	setListItems(listItems: Array<Type.ListItemWithId>) {
		this.listItems = listItems;
		return this;
	}

	template = () => html`
	<li>List ID ${this.id}</li>

	${this.listItems.map(({ id, value }) =>
		new ListItem(id)
			.set({ text: value })
			.on(`onDelete`, this, `onDelete`, id)
			.on(`onInput`, this, `onInput`, id)
	)}

	<li>
		<button
			${this.on(`click`, `onAdd`)}
			type="button"
		>Add</button>
	</li>
	`;
}
