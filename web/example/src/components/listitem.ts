import { Component } from '@robertakarobin/web/index.ts';
import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import { Textbox } from '@src/components/textbox.ts';

export class ListItem extends Component<ListItem> {
	add = new Emitter<void>();
	move = new Emitter<number>();
	remove = new Emitter<void>();
	value = new Emitter<string>();

	constructor({ value, ...attributes }: {
		id: string;
		value: string;
	}) {
		super(attributes);
		this.value.next(value);
	}

	template = () => `
<div>
	${this.id}
	<button
		onclick=${this.bind(`move`, -1)}
		type="button"
	>↑</button>
	<button
		onclick=${this.bind(`move`, 1)}
		type="button"
	>↓</button>
	<button
		type="button"
		onclick=${this.bind(`add`)}
	>Add before</button></li>
	<button
		type="button"
		onclick=${this.bind(`remove`)}
	>Remove</button></li>
	${new Textbox({ value: this.value.last })
		.on(`value`, (textbox, value) => textbox.closest(ListItem).value.next(value))
		.render()
	}
</div>
	`;
}
