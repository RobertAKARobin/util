import { type EntityWithId } from '@robertakarobin/util/util/emitter/entities';

export type ListItem = {
	value: string;
};

export type ListItemWithId = EntityWithId<ListItem>;

export type List = Array<ListItem>;
