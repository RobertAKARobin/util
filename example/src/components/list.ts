import { Component } from '@robertakarobin/web/component.ts';

import type * as Type from '@src/types.js';
import { ListItem } from './listitem.ts';

@Component.define()
export class List extends Component {
	listItems = [] as Array<Type.ListItem>;

	@Component.event()
	onAdd() {}

	setListItems(listItems: Array<Type.ListItem>) {
		this.listItems = listItems;
		return this;
	}

	template = () => `
	<li>List ID ${this.id}</li>

	${this.listItems.map(({ id, value }) =>
		new ListItem(id).set({ value })
	).join(`\n`)}

	<li>
		<button
			onclick="${this.bind(`onAdd`)}"
			type="button"
		>Add</button>
	</li>
	`;
}
