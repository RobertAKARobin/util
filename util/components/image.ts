import { Component } from './component.ts';

@Component.define()
export class Image extends Component.custom(`img`) {
	@Component.attribute() override alt!: string;
	@Component.attribute() override src!: string;
}
