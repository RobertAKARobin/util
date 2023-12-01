import { Component } from '@robertakarobin/web/index.ts';
import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import textbox from '@src/components/textbox.ts';

export class ListItemComponent extends Component<ListItemComponent> {
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

	onAdd() {
		this.add.next();
	}

	onArrow(event: Event, increment: number) {
		this.move.next(increment);
	}

	onRemove() {
		this.remove.next();
	}

	template = () => `
<div>
	${this.id}
	<button
		onclick=${this.bind(`onArrow`, -1)}
		type="button"
	>↑</button>
	<button
		onclick=${this.bind(`onArrow`, 1)}
		type="button"
	>↓</button>
	<button
		type="button"
		onclick=${this.bind(`onAdd`)}
	>Add before</button></li>
	<button
		type="button"
		onclick=${this.bind(`onRemove`)}
	>Remove</button></li>
	${textbox({ value: this.value.last })
		.on(`value`, value => this.value.next(value))
		.render()
	}
</div>
	`;
}

export default Component.toFunction(ListItemComponent);
