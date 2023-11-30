import { Component } from '@robertakarobin/web/index.ts';

import { type ListItem, state } from '@src/state.ts';
import textbox from '@src/components/textbox.ts';

export class ListItemComponent extends Component<ListItemComponent> {
	accept(input: ListItem) {
		return input;
	}

	onLoad() {
		if (this.isUidPersisted) {
			state.upsert(this.uid!, this.$);
		}
	}

	template = () => `
<div>
	<button type="button">↑</button>
	<button type="button">↓</button>
	${textbox()
		.set({ value: this.$.value })
		.render()}
</div>
	`;
}

export default Component.toFunction(ListItemComponent);
