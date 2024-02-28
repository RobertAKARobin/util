import { Component } from './component.ts';

@Component.define()
export class Image extends Component.custom(`img`) {
	@Component.attribute() alt!: string;
	@Component.attribute() src!: string;
}
