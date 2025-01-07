import { SpecBuilder } from './src/builder';
import { SpecRenderer } from './src/renderer';

export {
	SpecBuilder,
	SpecRenderer,
};

export const builder = new SpecBuilder();

export const count = builder.count; // eslint-disable-line @typescript-eslint/unbound-method
export const suite = builder.suite; // eslint-disable-line @typescript-eslint/unbound-method
export const test = builder.test; // eslint-disable-line @typescript-eslint/unbound-method

export const renderer = new SpecRenderer();

export const print = renderer.print;
export const render = renderer.render;

export type * as Type from './src/types.d';
