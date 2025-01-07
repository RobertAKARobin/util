import { print } from '@robertakarobin/util/util/spec/index';

import * as Web from './index.spec';

print(await Web.spec({}), {
	exit: true,
	verbose: true,
});
