import { appContext } from '../../context.ts';
import { EntityStateEmitter } from '@robertakarobin/jsutil/entities.ts';

export type ListItem = {
	value: string;
};

export const state = new EntityStateEmitter<ListItem>();

if (appContext === `build`) {
	state.add({
		value: `hello`,
	});
} else {
	state.next(state.last);
}
