import { Component } from '@robertakarobin/web/index.ts';

import { type ListItem, state } from '@src/state.ts';
import textbox from '@src/components/textbox.ts';

export class ListItemComponent extends Component<ListItemComponent> {
	accept(input: ListItem) {
		return input;
	}

	onLoad() {
		state.upsert(this.uid!, this.$);
	}

	template = () => `
<div>
	<button type="button">↑</button>
	<button type="button">↓</button>
	${textbox()
		.notify(this, `state`)
		.set({ value: this.$.value })
		.render()}
</div>
	`;
}

export default Component.toFunction(ListItemComponent);
