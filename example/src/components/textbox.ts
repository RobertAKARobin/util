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

	@Component.event()
	emitValue(event: Event) {
		const updated = (event.currentTarget as HTMLInputElement).value;
		if (updated !== this.value) {
			this.value = updated;
			this.render();
		}
		return this.value;
	}

	template = () => `
<input
	maxlength="${this.maxLength}"
	oninput="${this.bind(`emitValue`)}"
	placeholder="Type here"
	type="text"
	value="${this.value ?? ``}"
>

<span>
	${this.maxLength - this.value.length} / ${this.maxLength} Remaining
</span>

<p>textbox ID ${this.id}</p>
	`;
}
