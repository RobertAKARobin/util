import { type EntityWithId } from '@robertakarobin/util/emitter/entities.ts';

export type ListItem = {
	value: string;
};

export type ListItemWithId = EntityWithId<ListItem>;

export type List = Array<ListItem>;
