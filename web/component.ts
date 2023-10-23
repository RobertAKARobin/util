export type Args = Array<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export type Template<
	TemplateArgs extends Args = Args
> = (...args: TemplateArgs) => string;

export type Component<
	TemplateArgs extends Args = Args
> = {
	style?: string;
	template: Template<TemplateArgs>;
};

const styleCache = new WeakMap<Component, HTMLStyleElement>();

export function component<
	TemplateArgs extends Args
>(
	input: Component<TemplateArgs>,
) {
	return (...args: TemplateArgs) => {
		if (input.style && !styleCache.has(input as Component)) { // TODO1: Handle when not CSR
			const $style = document.createElement(`style`); // TODO1: Scoped styles?
			$style.textContent = input.style;
			document.head.appendChild($style);
			styleCache.set(input as Component, $style);
		}

		return input.template(...args);
	};
}
