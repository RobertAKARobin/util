import { EntityStateEmitter } from '@robertakarobin/jsutil/entities.ts';

import type * as Type from '@src/types.d.ts';

export const state = new EntityStateEmitter<Type.ListItem>();
state.add({
	value: `hello`,
});
