import { run, suite, test } from '@robertakarobin/spec';

import * as SpecLib from './spec/index.spec.ts';

export const spec = suite(`@robertakarobin/util`, {},
	SpecLib.spec,
);

run(await spec({}));
