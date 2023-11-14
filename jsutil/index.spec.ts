import { suite } from '@robertakarobin/spec';

import * as Emitter from './emitter.spec.ts';
import * as stringMates from './string-mates.spec.ts';

export const spec = suite(`@robertakarobin/js`, {},
	Emitter.spec,
	stringMates.spec,
);
