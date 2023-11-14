import { run, suite, test } from '@robertakarobin/spec';

import * as JSUtil from './jsutil/index.spec.ts';
import * as SpecLib from '@robertakarobin/spec/index.spec.ts';
import * as Web from '@robertakarobin/web/spec/index.spec.ts';

export const spec = suite(`@robertakarobin/util`, {},
	test(`@robertakarobin/jsutil`, async $ => {
		const results = await JSUtil.spec({});
		$.assert(x => x(results.status) === `pass`);
	}),

	SpecLib.spec,

	Web.spec,
);

run(await spec({}), { verbose: true });
