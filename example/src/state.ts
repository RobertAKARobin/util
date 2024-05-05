import { appContext } from '@robertakarobin/util/web/context.ts';
import { EntityStateEmitter } from '@robertakarobin/util/emitter/entities.ts';

import type * as Type from '@src/types.d.ts';

export const state = new EntityStateEmitter<Type.ListItem>();
if (appContext === `build`) {
	state.add({
		value: `hello`,
	});
	state.add({
		value: `world`,
	});
}
