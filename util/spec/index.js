import { SpecBuilder } from './src/builder.js';
import { SpecRenderer } from './src/renderer.js';

export {
	SpecBuilder,
	SpecRenderer,
};

export const builder = new SpecBuilder();

/**
 * See {@link SpecBuilder.count}
 */
export const count = builder.count; // eslint-disable-line @typescript-eslint/unbound-method

/**
 * See {@link SpecBuilder.suite}
 */
export const suite = builder.suite; // eslint-disable-line @typescript-eslint/unbound-method

/**
 * See {@link SpecBuilder.test}
 */
export const test = builder.test; // eslint-disable-line @typescript-eslint/unbound-method

export const renderer = new SpecRenderer();

/**
 * See {@link SpecRenderer.print}
 */
export const print = renderer.print; // eslint-disable-line @typescript-eslint/unbound-method

/**
 * See {@link SpecRenderer.render}
 */
export const render = renderer.render; // eslint-disable-line @typescript-eslint/unbound-method
