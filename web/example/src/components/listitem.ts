import { Component } from '@robertakarobin/web/index.ts';

import { type state } from '../state.ts';
import textbox from './textbox.ts';

type ListItem = typeof state.last.listItems[number];

export class ListItemComponent extends Component {

	listItem: ListItem;

	constructor(input: {
		listItem: ListItem;
	}) {
		super();
		this.listItem = input.listItem;
	}

	template = () => `
<div>
	<button>↑</button>
	<button>↓</button>
	${textbox({ value: this.listItem.value }).render()}
</div>
	`;
}

export default Component.toFunction(ListItemComponent);
