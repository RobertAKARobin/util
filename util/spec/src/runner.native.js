/**
 * @import * as Type from './types.d';
 */

import path from 'path';

import { suite } from '../index.js';

/** @type {Type.SpecRunner} */
export const specRunNative = async function(
	specFiles,
	options,
) {
	const specs = /** @type {Array<typeof Type.Test>} */([]);

	for (const specFile of specFiles) {
		const { spec } = await /** @type {Promise<{ spec: typeof Type.Test; }>} */(
			import(path.join(/** @type {string} */(process.env.PWD), specFile))
		);

		if (typeof spec !== `function`) {
			throw new Error(specFile);
		}

		specs.push(spec);
	}

	const spec = suite(`native`, options ?? {}, ...specs); // TODO2: Pass in `suite` as an argument, in case SpecBuilder is subclassed?

	const result = await spec({});

	return result;
};

