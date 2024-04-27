import { print } from './index.ts';

import * as Meta from './spec.spec.ts';

print(await Meta.spec({}));
