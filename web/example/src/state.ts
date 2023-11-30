import { appContext } from '@robertakarobin/web/context.ts';
import { EntityStateEmitter } from '@robertakarobin/jsutil/entities.ts';

export type ListItem = {
	value: string;
};

export const state = new EntityStateEmitter<ListItem>();
if (appContext === `browser`) {
	state.add({
		value: `hello`,
	});
}
