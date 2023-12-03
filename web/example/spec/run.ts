import { run } from '@robertakarobin/jsutil/spec';

import * as Web from './index.spec.ts';

run(await Web.spec({}));
