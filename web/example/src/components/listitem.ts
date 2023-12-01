import { Component } from '@robertakarobin/web/index.ts';

import { state } from '@src/state.ts';
import textbox from '@src/components/textbox.ts';

export class ListItemComponent extends Component<ListItemComponent> {
	value: string;

	constructor({ value, ...attributes }: {
		id: string;
		value: string;
	}) {
		super(attributes);
		this.value = value;
	}

	onArrow(increment: number) {
		state.move(this.id, increment);
	}

	onLoad() {
		state.upsert(this.id, {
			value: this.value,
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
	${textbox({ value: this.value }).render()}
</div>
	`;
}

export default Component.toFunction(ListItemComponent);
