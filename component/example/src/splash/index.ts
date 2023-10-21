import { Component } from 'component/src/component';
import { bind } from '../../util';

function greet(event: MouseEvent, name: string) {
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

	<p><button onclick="${bind(greet, `Steve`)}">Click me</button></p>
</div>
	`;
}
