import { Component } from '@robertakarobin/web/component.ts';

import { Textbox } from '@src/components/textbox.ts';

export class ListItem extends Component(`div`, {
	'data-value': ``,
}) {
	static {
		this.init();
	}

	template = () => `
<div>
	${this.id}
	<button
		type="button"
	>↑</button>
	<button
		type="button"
	>↓</button>
	<button
		type="button"
	>Add before</button>
	${Textbox.get(this.id).setAttributes({ 'data-value': this.get(`data-value`) })}
	<button
		type="button"
	>Remove</button>
</div>
	`;
}
