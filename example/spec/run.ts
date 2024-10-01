import { print } from '@robertakarobin/util/spec/index.ts';

import * as Web from './index.spec.ts';

print(await Web.spec({}));
