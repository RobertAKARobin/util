import { execSync } from 'child_process';
import fs from 'fs';

import { test } from '../spec/index';

import { sharedEnv } from './sharedEnv';

export const spec = test(import.meta.url, async $ => {
	const env = await sharedEnv(`env`, () => ({
		msg: execSync(`echo "hello"`).toString().trim(),
	}));

	$.assert(x => x(env.msg) === `hello`);
	$.assert(x => x(fs.readFileSync(`./env.json`, { encoding: `utf8` })) === `{"msg":"hello","$filename":"env.json"}`);
	fs.rmSync(`./env.json`);
});
