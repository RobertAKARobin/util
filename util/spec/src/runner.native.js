/**
 * @import * as Type from './types.d';
 */

import { suite } from '../index';

/** @type {Type.SpecRunner} */
export const specRunNative = async function(
	specFiles,
	options,
) {
	const specs = /** @type {Array<typeof Type.Test>} */([]);

	for (const specFile of specFiles) {
		const { spec } = await /** @type {Promise<{ spec: typeof Type.Test; }>} */(
			import(specFile)
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

