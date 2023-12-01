import { Component } from '@robertakarobin/web/index.ts';
import { Emitter } from '@robertakarobin/jsutil/emitter.ts';

import { state } from '@src/state.ts';
import textbox from '@src/components/textbox.ts';

export class ListItemComponent extends Component<ListItemComponent> {
	value = new Emitter<string>();

	constructor({ value, ...attributes }: {
		id: string;
		value: string;
	}) {
		super(attributes);
		this.value.next(value);
	}

	onArrow(increment: number) {
		state.move(this.id, increment);
	}

	onLoad() {
		state.upsert(this.id, {
			value: this.value.last,
		});
	}

	template = () => `
<div>
	<button
		onclick=${this.bind(`onArrow`, -1)}
		type="button"
	>↑</button>
	<button
		onclick=${this.bind(`onArrow`, 1)}
		type="button"
	>↓</button>
	${textbox({ value: this.value.last })
		.on(`value`, value => this.value.next(value))
		.render()
	}
</div>
	`;
}

export default Component.toFunction(ListItemComponent);
