import { run } from '@robertakarobin/util/spec/index.ts';

import * as Web from './index.spec.ts';

run(await Web.spec({}));
