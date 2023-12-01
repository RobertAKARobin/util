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
	addAt = new Emitter<number>();
	items: List;
	move = new Emitter<[string, number]>();
	remove = new Emitter<string>();
	value = new Emitter<{ id: string; value: string; }>();

	constructor({ items, ...attributes }: {
		items: List;
	}) {
		super(attributes);
		this.items = items;
	}

	template = () => `
<ol>
	${this.items.map(({ id, value }, index) => `
		<li>${listItem({ id, value })
			.on(`add`, () => this.addAt.next(index))
			.on(`move`, increment => this.move.next([id, increment]))
			.on(`remove`, () => this.remove.next(id))
			.on(`value`, value => this.value.next({ id, value }))
			.render()
		}</li>
	`).join(`\n`)}
</ol>
	`;
}

export default Component.toFunction(ListComponent);
