import { Component } from '@robertakarobin/web/index.ts';

import { type state } from '../state.ts';
import textbox from './textbox.ts';

type ListItem = typeof state.last.listItems[number];

export class ListItemComponent extends Component {
	accept(input: ListItem) {
		return input;
	}

	template = () => `
<div>
	<button type="button">↑</button>
	<button type="button">↓</button>
	${textbox()
		.set({ value: this.$.value })
		.on(`state`, () => console.log(`ay`))
		.render()}
</div>
	`;
}

export default Component.toFunction(ListItemComponent);
