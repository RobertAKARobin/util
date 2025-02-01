import type fsType from 'fs';
import type pathType from 'path';

import { importAs } from './importAs';
import { runContext } from './web/context';

export async function fetchText(target: string) {
	if (runContext === `browser`) {
		const response = await fetch(target);
		const text = await response.text();
		return text;

	} else {
		const fs = await importAs<typeof fsType>(`fs`);
		const path = await importAs<typeof pathType>(`path`);
		const targetPath = path.join(process.cwd(), target);
		const text = await fs.promises.readFile(targetPath, { encoding: `utf8` });
		return text;

	}
}
