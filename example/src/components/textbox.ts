import { Component, html } from '@robertakarobin/web/component.ts';

import { types } from '@src/theme.ts';

const style = `
input {
	${types.body}
}
`;

@Component.define({ style })
export class Textbox extends Component.custom(`div`) {
	@Component.attribute({ name: `data-max` }) maxLength = 10;
	onValue = this.event<string>(`onValue`);
	@Component.attribute({ name: `data-value` }) value = ``;

	onInput(event: Event) {
		const updated = (event.currentTarget as HTMLInputElement).value;
		if (updated !== this.value) {
			this.value = updated;
			this.render();
			this.onValue(updated);
		}
	}

	template = () => html`
<input
	class="${(this.value ?? ``).length >= (this.maxLength - 5) ? `warning` : ``}"
	id="${this.id}-input"
	maxlength="${this.maxLength}"
	oninput="${this.bind(`onInput`)}"
	placeholder="Type here"
	type="text"
	value="${this.value ?? ``}"
>

<span id="${this.id}-remaining">
	${this.maxLength - (this.value ?? ``).length} / ${this.maxLength} Remaining
</span>

<p>textbox ID ${this.id}</p>
	`;
}


