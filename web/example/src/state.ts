import { appContext } from '@robertakarobin/web/context.ts';
import { EntityStateEmitter } from '@robertakarobin/jsutil/entities.ts';

import type * as Type from '@src/types.d.ts';

export const state = new EntityStateEmitter<Type.ListItem>();
if (appContext === `browser`) {
	state.add({
		value: `hello`,
	});
}
