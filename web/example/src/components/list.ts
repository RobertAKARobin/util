import { Component } from '@robertakarobin/web/index.ts';
import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import listItem from './listitem.ts';

export type ListItem = {
	value: string;
};

export type List = Array<ListItem & {
	id: string;
}>;

export class ListComponent extends Component<ListComponent> {
	items: List;
	update = new Emitter<{ id: string; value: string; }>();

	constructor({ items, ...attributes }: {
		items: List;
	}) {
		super(attributes);
		this.items = items;
	}

	addListItem(input: ListItem) {
		console.log(input);
	}

	onArrow(id: string, increment: number) {
		console.log(increment);
	}

	onValue(id: string, value: string) {
		console.log(id, value);
	}

	template = () => `
<ol>
	${this.items.map(({ id, value }) => `
		<li>${listItem({ id, value })
			.on(`value`, value => this.update.next({ id, value }))
			.render()
		}</li>
	`).join(`\n`)}

	<li><button type="button" onclick=${this.bind(`addListItem`)}>Add</button></li>
</ol>
	`;
}

export default Component.toFunction(ListComponent);
