import { EntityStateEmitter } from '@robertakarobin/util/entities.ts';

import type * as Type from '@src/types.d.ts';
import { appContext } from '../../context.ts';

export const state = new EntityStateEmitter<Type.ListItem>();
if (appContext === `build`) {
	state.add({
		value: `hello`,
	});
}
