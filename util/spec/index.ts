import { SpecBuilder } from './src/builder.ts';
import { SpecRenderer } from './src/renderer.ts';

export {
	SpecBuilder,
	SpecRenderer,
};

export const runner = new SpecBuilder();

export const suite = runner.suite; // eslint-disable-line @typescript-eslint/unbound-method
export const test = runner.test;

export const renderer = new SpecRenderer();

export const print = renderer.print;
export const render = renderer.render;

export type * as Type from './src/types.d.ts';
