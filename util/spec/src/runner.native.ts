import type * as Type from './types.d';
import { suite } from '../index';

export const specRunNative: Type.SpecRunner = async function(
	specFiles,
	options,
) {
	const specs = [] as Array<typeof Type.Test>;

	for (const specFile of specFiles) {
		const { spec } = await import(specFile) as {
			spec: typeof Type.Test;
		};

		if (typeof spec !== `function`) {
			throw new Error(specFile);
		}

		specs.push(spec);
	}

	const spec = suite(`native`, options ?? {}, ...specs); // TODO2: Pass in `suite` as an argument, in case SpecBuilder is subclassed?

	const result = await spec({});

	return result;
};

