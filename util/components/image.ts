import { Component } from './component';

@Component.define()
export class Image extends Component.custom(`img`) {
	@Component.attribute() override alt!: string;
	@Component.attribute() override src!: string;
}
