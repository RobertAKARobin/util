import { ComponentFactory } from '@robertakarobin/web/component.ts';
import { Emitter } from '@robertakarobin/util/emitter.ts';

import type * as Type from '@src/types.js';
import { ListItem } from './listitem.ts';

export class List extends ComponentFactory(`ol`) {
	static {
		this.init();
	}

	events = {
		add: () => ({}),
	};

	listItems = new Emitter<Array<Type.ListItem>>();

	onAdd = () => this.emit(`add`);

	setListItems(listItems: Array<Type.ListItem>) {
		this.listItems.set(listItems);
		return this;
	}

	template = () => `
	${this.listItems.value.map(({ value }, index) =>
		ListItem.get(`${this.id}-${index}`).set({ 'data-value': value })
	).join(`\n`)}
<li>
	<button
		onclick="${this.bind(`onAdd`)}"
		type="button"
	>Add</button>
</li>
	`;
}
