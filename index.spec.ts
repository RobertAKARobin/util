import { run, suite } from '@robertakarobin/spec';

import * as SpecLib from '@robertakarobin/spec/index.spec.ts';
import * as Web from '@robertakarobin/web/spec/index.spec.ts';

import * as Emit from './emitter.spec.ts';

export const spec = suite(`@robertakarobin/util`, {},
	SpecLib.spec,
	Emit.spec,
	Web.spec,
);

run(await spec({}), { verbose: true });
