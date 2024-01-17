import { Component } from '@robertakarobin/web/component.ts';

import { types } from '@src/theme.ts';

const style = `
input {
	${types.body}
}
`;

@Component.define({ style })
export class Textbox extends Component.custom(`div`) {
	@Component.attribute({ name: `data-max` }) maxLength = 10;
	@Component.attribute({ name: `data-value` }) value = ``;

	constructor(id: string) {
		super(id);
	}

	@Component.event()
	onInput(event: Event) {
		const updated = (event.currentTarget as HTMLInputElement).value;
		if (updated !== this.value) {
			this.value = updated;
			this.render();
		}
		return updated;
	}

	template = () => /*html*/`
<input
	${Component.renderMode(`static`)}
	maxlength="${this.maxLength}"
	oninput="${this.bind(`onInput`)}"
	placeholder="Type here"
	type="text"
	value="${this.value ?? ``}"
>

<span
	${Component.renderMode(`inner`)}
	id="${this.id}-remaining"
>
	${this.maxLength - (this.value ?? ``).length} / ${this.maxLength} Remaining
</span>

<p>textbox ID ${this.id}</p>
	`;
}


