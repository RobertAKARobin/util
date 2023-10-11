import { SpecRunner } from '../src/runner.ts';

const runner = new SpecRunner();

export const suite = runner.suite.bind(runner);

export const test = runner.test.bind(runner);
