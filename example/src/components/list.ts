import { Component, html } from '@robertakarobin/web/component.ts';

import type * as Type from '@src/types.js';
import { ListItem } from './listitem.ts';

@Component.define()
export class List extends Component.custom(`ol`) {
	listItems = [] as Array<Type.ListItem>;

	@Component.event()
	emitAdd() {}

	setListItems(listItems: Array<Type.ListItem>) {
		this.listItems = listItems;
		return this;
	}

	template = () => html`
	<li>List ID ${this.id}</li>

	${this.listItems.map(({ id, value }) =>
		ListItem.get(id).set({ value })
	)}

	<li>
		<button
			onclick="${this.bind(`emitAdd`)}"
			type="button"
		>Add</button>
	</li>
	`;
}
