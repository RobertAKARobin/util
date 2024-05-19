import { Component, html } from '@robertakarobin/util/components/component.ts';

@Component.define({
	stylePath: import.meta.url,
})
export class Textbox extends Component.custom(`div`) {
	@Component.attribute({ name: `data-max` }) maxLength = 10;
	@Component.attribute({ name: `data-value` }) value = ``;

	@Component.event()
	onInput(event: Event) {
		const updated = (event.target as HTMLInputElement).value;
		if (updated !== this.value) {
			this.value = updated;
			this.render(`#${this.id}-remaining`);
		}
		return updated;
	}

	template = () => html`
<input
	maxlength="${this.maxLength}"
	${this.on(`input`, `onInput`)}
	placeholder="Type here"
	type="text"
	value="${this.value}"
>

<span id="${this.id}-remaining">
	${this.maxLength - (this.value ?? ``).length} / ${this.maxLength} Remaining
</span>

<p>textbox ID ${this.id}</p>
	`;
}


