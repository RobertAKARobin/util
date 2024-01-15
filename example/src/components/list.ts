import { Component } from '@robertakarobin/web/component.ts';

import type * as Type from '@src/types.js';
import { ListItem } from './listitem.ts';

@Component.define()
export class List extends Component.custom(`ol`) {
	listItems = [] as Array<Type.ListItem>;

	@Component.event()
	onAdd() {}

	@Component.event()
	onDelete(id: string) {
		console.log(id);
		return id;
	}

	setListItems(listItems: Array<Type.ListItem>) {
		this.listItems = listItems;
		return this;
	}

	template = () => /*html*/`
	<li>List ID ${this.id}</li>

	${this.listItems.map(({ id, value }) =>
		new ListItem(id!)
			.set({ text: value })
			.on(`onDelete`, () => this.onDelete(id!))
	).join(``)}

	<li>
		<button
			onclick="${this.bind(`onAdd`)}"
			type="button"
		>Add</button>
	</li>
	`;
}
