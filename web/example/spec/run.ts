import { print } from '@robertakarobin/spec';

import * as Web from './index.spec.ts';

print(await Web.spec({}));
