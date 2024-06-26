import { diff } from '../../util/spec/diff.ts';
import { execUntil } from '../../util/node/execUntil.ts';
import { pathRelative } from '../../util/pathRelative.ts';
import { readRelative } from '../../util/readRelative.ts';
import { test } from '../../util/spec/index.ts';

import { cssJs } from '../css-js.js';

export const spec = test(import.meta.url, async $ => {
	await cssJs(
		pathRelative(import.meta.url, `./css-js.spec.css.js`),
		pathRelative(import.meta.url, `./css-js.spec.css`),
	);

	execUntil(`stylelint --fix csslint/spec/css-js.spec.css`);

	const golden = readRelative(import.meta.url, `./css-js.spec.golden.css`);
	const subject = readRelative(import.meta.url, `./css-js.spec.css`);

	$.assert(x => x(diff(golden, subject)) === ``);
});
