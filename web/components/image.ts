import { Component } from '../component.ts';

@Component.define()
export class Image extends Component {
	@Component.attribute() alt = ``;
	@Component.attribute() src = ``;
}
