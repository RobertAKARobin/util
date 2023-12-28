import { ComponentFactory } from '@robertakarobin/web/component.ts';

import type * as Type from '@src/types.js';
import { ListItem } from './listitem.ts';

export class List extends ComponentFactory(`ol`) {
	static {
		this.init();
	}

	events = {
		add: () => ({}),
		...ListItem.prototype.events,
	};

	listItems = [] as Array<Type.ListItem>;

	onAdd = () => this.emit(`add`);

	setListItems(listItems: Array<Type.ListItem>) {
		this.listItems = listItems;
		return this;
	}

	template = () => `
	<li>List ID ${this.id}</li>
	${this.listItems.map(({ id, value }) =>
		new ListItem({ id }).set({ 'data-value': value })
	).join(`\n`)}
<li>
	<button
		onclick="${this.bind(`onAdd`)}"
		type="button"
	>Add</button>
</li>
	`;
}
