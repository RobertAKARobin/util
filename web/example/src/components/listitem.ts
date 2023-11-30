import { Component } from '@robertakarobin/web/index.ts';

import { type state } from '../state.ts';
import textbox from './textbox.ts';

type ListItem = typeof state.last.listItems[number];

export class ListItemComponent extends Component<ListItemComponent> {
	accept(input: ListItem) {
		return input;
	}

	onInput(event: Event, ...args: []) {
		console.log(event, args);
	}

	template = () => `
<div>
	<button type="button">↑</button>
	<button type="button">↓</button>
	${textbox()
		.set({ value: this.$.value })
		.on(`state`, this.bind(`onInput`))
		.render()}
</div>
	`;
}

export default Component.toFunction(ListItemComponent);
