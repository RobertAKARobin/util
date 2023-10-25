import { type environments } from './index.ts';

export type Args = Array<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export type Component<
	TemplateArgs extends Args = Args
> = {
	style?: string;
	template: Template<TemplateArgs>;
};

export type Environment = typeof environments[number];

export type Template<
	TemplateArgs extends Args = Args
> = (...args: TemplateArgs) => string;
