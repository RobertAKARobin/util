import { run, suite, test } from '@robertakarobin/spec';

import * as Emit from './emit/index.spec.ts';
import * as SpecLib from './spec/index.spec.ts';

export const spec = suite(`@robertakarobin/util`, {},
	SpecLib.spec,
	Emit.spec,
);

run(await spec({}));
