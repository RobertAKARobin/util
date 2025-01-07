import { EntityStateEmitter } from '@robertakarobin/util/util/emitter/entities';
import { runContext } from '@robertakarobin/util/util/web/context';

import type * as Type from '@src/types.d';

export const state = new EntityStateEmitter<Type.ListItem>();
if (runContext === `server`) {
	state.add({
		value: `hello`,
	});
	state.add({
		value: `world`,
	});
}
