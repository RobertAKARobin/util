/**
 * @import { EntityId } from './entities';
 */

import { test } from '../spec/index';

import { EntityStateEmitter } from './entities';

/**
 * @typedef {{ value: string }} Item
 */

// TODO1: More specs
export const spec = test(import.meta.url, $ => {
	const state = /** @type {EntityStateEmitter<Item>} */(new EntityStateEmitter());

	/** @type {EntityId} */let item1Id;
	$.log(() => item1Id = state.add({ value: `aaa` }));
	$.assert(x => x(state.length()) === 1);
	$.assert(x => x(state.indexOf(item1Id)) === 0);
	$.assert(x => x(state.get(item1Id).value) === `aaa`);

	/** @type {EntityId} */let item2Id;
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
