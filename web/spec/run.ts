import { run } from '@robertakarobin/spec';

import * as Web from './index.spec.ts';

run(await Web.spec({}));
