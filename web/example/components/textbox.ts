import { Component } from '@robertakarobin/web';

const value = ``;
const max = 10;

export class Textbox extends Component {
	handleInput(event: Event, name: string) {
		// value = (event.target as HTMLInputElement).value;
		console.log(event.target);
	}

	template() {
		return `
		<div>
			<input
				oninput=${this.bind(`handleInput`, `steve`)}
				max="${max}"
				placeholder="Type here"
				type="text"
				/>

			<span>${value.length} / ${max} Remaining</span>
		</div>
		`;
	}
}

export default Component.toFunction(Textbox);
