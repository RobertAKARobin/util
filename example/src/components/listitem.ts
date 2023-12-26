import { ComponentFactory } from '@robertakarobin/web/component.ts';

import { Textbox } from '@src/components/textbox.ts';

export class ListItem extends ComponentFactory(`li`, {
	'data-value': {
		default: ``,
	},
}) {
	static {
		this.init();
	}

	template = () => `
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
	${Textbox.get(`${this.id}-txt`)
		.set({ 'data-value': this.get(`data-value`) })}
	<button
		type="button"
	>Remove</button>
	`;
}
