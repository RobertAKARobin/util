import { print } from './spec/index.ts';

import * as Meta from './index.spec.ts';

print(await Meta.spec({}));
