import { Component, html } from '@robertakarobin/util/components/component.ts';
import { type EntityId } from '@robertakarobin/util/emitter/entities.ts';

import type * as Type from '@src/types.d.ts';
import { ListItem } from './listitem.ts';

@Component.define()
export class List extends Component.custom(`ol`) {
	listItems = [] as Array<Type.ListItemWithId>;

	@Component.event()
	onListAdd() {}

	@Component.event()
	onListDelete(event: CustomEvent, id: EntityId) {
		return id;
	}

	@Component.event()
	onListInput(event: CustomEvent<string>, id: EntityId) {
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
			.on(`onListItemDelete`, this, `onListDelete`, id)
			.on(`onListItemInput`, this, `onListInput`, id)
	)}

	<li>
		<button
			${this.on(`click`, `onListAdd`)}
			type="button"
		>Add</button>
	</li>
	`;
}
