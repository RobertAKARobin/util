import { Component } from 'component/src/component';

export class SplashPage extends Component {
	style = `
h1 {
	color: red;
}
	`;

	template = () => `
<div>
	<h1>Hello world</h1>

	<p><button>Click me</button></p>
</div>
	`;
}
