import { test } from '../spec/index.ts';

import { type EntityId, EntityStateEmitter } from './entities.ts';

type Item = {
	value: string;
};

export const spec = test(import.meta.url, $ => {
	const state = new EntityStateEmitter<Item>();

	let item1Id: EntityId;
	$.log(() => item1Id = state.add({ value: `aaa` }));
	$.assert(x => x(state.length()) === 1);
	$.assert(x => x(state.indexOf(item1Id)) === 0);
	$.assert(x => x(state.get(item1Id).value) === `aaa`);

	let item2Id: EntityId;
	$.log(() => item2Id = state.add({ value: `bbb` }));
	$.assert(x => x(state.length()) === 2);
	$.assert(x => x(state.indexOf(item2Id)) === 1);
	$.assert(x => x(state.get(item2Id).value) === `bbb`);

	$.log(() => state.add({ value: `ccc` }));
	$.assert(x => x(state.length()) === 3);
	$.assert(x => x(state.indexOf(item1Id)) === 0);
	$.assert(x => x(state.indexOf(item2Id)) === 1);
	$.assert(x => x(state.get(state.fromEnd())).value === `ccc`);

	$.log(() => state.move(item1Id, state.length() - 1));
	$.assert(x => x(state.indexOf(item1Id)) === 2);
	$.assert(x => x(state.indexOf(item2Id)) === 0);
});
