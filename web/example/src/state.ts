import { EntityStateEmitter } from '@robertakarobin/jsutil/entities.ts';

export type ListItem = {
	value: string;
};

export const state = new EntityStateEmitter<ListItem>();
