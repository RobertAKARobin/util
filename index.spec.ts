import { run, suite, test } from '@robertakarobin/jsutil/spec';

import * as JSUtil from './jsutil/index.spec.ts';
import * as SpecLib from '@robertakarobin/jsutil/spec/index.spec.ts';

export const spec = suite(`@robertakarobin/util`, {},
	test(`@robertakarobin/jsutil`, async $ => {
		const results = await JSUtil.spec({});
		$.assert(x => x(results.status) === `pass`);
	}),

	SpecLib.spec,
);

run(await spec({}), { verbose: true });
