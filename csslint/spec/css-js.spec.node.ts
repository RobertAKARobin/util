import { diff } from '../../util/spec/diff';
import { execUntil } from '../../util/node/execUntil';
import { pathRelative } from '../../util/node/pathRelative';
import { readRelative } from '../../util/node/readRelative';
import { test } from '../../util/spec/index';

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
