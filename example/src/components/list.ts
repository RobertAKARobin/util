import { Component, html } from '@robertakarobin/util/util/components/component';
import { type EntityId } from '@robertakarobin/util/util/emitter/entities';

import type * as Type from '@src/types.d';
import { ListItem } from './listitem';

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

	override template = () => html`
	<li>List ID ${this.id}</li>

	${this.listItems.map(({ id, value }) =>
		new ListItem(id)
			.set({ text: value })
			.onEmit(`onListItemDelete`, this, `onListDelete`, id)
			.onEmit(`onListItemInput`, this, `onListInput`, id),
	)}

	<li>
		<button
			${this.on(`click`, `onListAdd`)}
			type="button"
		>Add</button>
	</li>
	`;
}
