import { Component } from 'component/src/component';
import { bind } from '../../util';

function greet(this: HTMLElement, event: MouseEvent, name: string) {
	console.log(this);
	console.log(event);
	console.log(`Hello ${name}`);
}

export class SplashPage extends Component {
	style = `
h1 {
	color: red;
}
	`;

	template = () => `
<div>
	<h1>Hello world</h1>

	<button onclick="${bind(greet, `aaa`)}">AAA</button>
	<button onclick="${bind(greet, `bbb`)}">BBB</button>
	<button onclick="${bind(greet, `ccc`)}">CCC</button>
</div>
	`;
}
