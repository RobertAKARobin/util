import { EntityStateEmitter } from '@robertakarobin/util/emitter/entities.ts';
import { runContext } from '@robertakarobin/util/web/context.ts';

import type * as Type from '@src/types.d.ts';

export const state = new EntityStateEmitter<Type.ListItem>();
if (runContext === `server`) {
	state.add({
		value: `hello`,
	});
	state.add({
		value: `world`,
	});
}
