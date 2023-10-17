import { run, suite } from '@robertakarobin/spec';

import * as Emit from '@robertakarobin/emit/index.spec.ts';
import * as SpecLib from '@robertakarobin/spec/index.spec.ts';

export const spec = suite(`@robertakarobin/util`, {},
	SpecLib.spec,
	Emit.spec,
);

run(await spec({}), { verbose: true });
