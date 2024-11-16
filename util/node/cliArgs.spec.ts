import { test } from '../spec/index.ts';

import { cliArgs } from './cliArgs.ts';

function argsFor(command: string) {
	return cliArgs<{
		age: string;
		name: string;
	}>(command.split(` `))[0];
}

function restFor(command: string) {
	return cliArgs(command.split(` `)).slice(1);
}

export const spec = test(import.meta.url, $ => {
	$.assert(x => x(JSON.stringify(argsFor(`user`))) === `{}`);
	$.assert(x => x(JSON.stringify(argsFor(`user steve`))) === `{}`);
	$.assert(x => x(argsFor(`user -name`).name) === `true`);
	$.assert(x => x(argsFor(`user -name=steve`).name) === `steve`);
	$.assert(x => x(argsFor(`user -name=steve -age`).age) === `true`);
	$.assert(x => x(argsFor(`user -name=steve -age`).name) === `steve`);
	$.assert(x => x(argsFor(`user -name=steve -age=32`).age) === `32`);
	$.assert(x => x(argsFor(`user -name=steve -age=32=32`).age) === `32=32`);

	const command = `user -name=steve admin -age=32 owner`;
	$.log(command);
	$.assert(x => x(argsFor(command).name) === `steve`);
	$.assert(x => x(argsFor(command).age) === `32`);
	$.assert(x => x(restFor(command).length) === 3);
	$.assert(x => x(restFor(command).join(` `)) === `user admin owner`);
});
