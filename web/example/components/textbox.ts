import { bind, component } from '@robertakarobin/web';

let value = ``;
const max = 10;
const handleInput = (event: InputEvent) => {
	value = (event.target as HTMLInputElement).value;
	console.log(value);
};

const template = () => `
<label>
	<input
		oninput=${bind(handleInput)}
		max="${max}"
		placeholder="Type here"
		type="text"
		/>

	<span>${value.length} / ${max} Remaining</span>
</label>
`;

export default component({
	template,
});
