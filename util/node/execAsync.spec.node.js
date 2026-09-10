import { test } from '../spec/index.js';
import { tryCatch } from '../tryCatch.js';

import { execAsync } from './execAsync.js';

export const spec = test(import.meta.url, async $ => {
	await $.assert(async x => x((await execAsync(`printf 42`)).stdout) === `42`);
	await $.assert(async x => x((await execAsync(`printf 42`)).stderr) === ``);

	await $.assert(async x => x((await execAsync(`printf 42 >&2`)).stdout) === ``);
	await $.assert(async x => x((await execAsync(`printf 42 >&2`)).stderr) === `42`);

	await $.assert(async x => x(await tryCatch(() => execAsync(`ls 42`))) instanceof Error);
});
