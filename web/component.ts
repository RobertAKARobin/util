export class Component {
	style?: string;

	readonly styleId? = `style--${this.constructor.name}`;

	template?: () => string;
}
