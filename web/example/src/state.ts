import { appContext } from '@robertakarobin/web/context.ts';
import { EntityStateEmitter } from '@robertakarobin/jsutil/entities.ts';

import { type ListItem } from './components/list.ts';

export const state = new EntityStateEmitter<ListItem>();
if (appContext === `browser`) {
	state.add({
		value: `hello`,
	});
}
