import { SpecRenderer } from './renderer.ts';
import { SpecRunner } from './runner.ts';

export {
	SpecRenderer,
	SpecRunner,
};

export const runner = new SpecRunner();

export const suite = runner.suite;
export const test = runner.test;

export const renderer = new SpecRenderer();

export const print = renderer.print;
export const render = renderer.render;
export const run = renderer.run;
