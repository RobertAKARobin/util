import { suite } from './spec/index.ts';

import * as Emitter from './emitter.spec.ts';
import * as Entities from './entities.spec.ts';
import * as MetaSpec from './spec/index.spec.ts';
import * as stringMates from './string-mates.spec.ts';

export const spec = suite(`@robertakarobin/js`, {},
	MetaSpec.spec,
	Emitter.spec,
	Entities.spec,
	stringMates.spec,
);
