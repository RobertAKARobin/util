import { Component } from '@robertakarobin/web/index.ts';
import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import type * as Type from '@src/types.d.ts';
import { Textbox } from '@src/components/textbox.ts';

export class ListItem extends Component<Type.ListItem> {
	add = new Emitter<void>();
	move = new Emitter<number>();
	remove = new Emitter<void>();
	value = new Emitter<string>();

	constructor(args: {
		id: string;
		value: string;
	}) {
		super(args);
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
	>Add before</button>
	<button
		type="button"
		onclick=${this.bind(`remove`)}
	>Remove</button>
	${
		new Textbox({ value: this.value.last })
			// .on(`value`, (value, item) => item.closest(ListItem).value.next(value))
			.render()
	}
</div>
	`;
}
