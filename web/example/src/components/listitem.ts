import { Component } from '@robertakarobin/web/index.ts';

import { type ListItem, state } from '@src/state.ts';
import textbox, { type Textbox } from '@src/components/textbox.ts';

export class ListItemComponent extends Component<ListItemComponent> {
	accept(input: ListItem) {
		return input;
	}

	onArrow(increment: number) {
		state.move(this.uid!, increment);
	}

	onLoad() {
		state.upsert(this.uid!, this.state.last);
	}

	onNotify(textbox: Textbox) {
		state.update(this.uid!, {
			value: textbox.state.last.value,
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
	${textbox()
		.notify(this, `state`)
		.set({ value: this.state.last.value })
		.render()}
</div>
	`;
}

export default Component.toFunction(ListItemComponent);
