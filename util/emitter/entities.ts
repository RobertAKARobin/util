import { newUid } from '../uid.ts';

import { Emitter } from './emitter.ts';

export type EntityId = number | string;

export type EntityState<Type> = {
	byId: Record<EntityId, Type>;
	ids: Array<EntityId>;
};

export class EntityStateEmitter<Type extends Record<EntityId, unknown>>
	extends Emitter<EntityState<Type>> {

	entries = this.pipe(({ byId, ids }) => ids.map(id => ({
		...byId[id],
		id,
	}))).set([]);

	constructor(
		...[initial, options]: ConstructorParameters<typeof Emitter<EntityState<Type>>>
	) {
		super(
			initial ?? {
				byId: {},
				ids: [],
			},
			options,
		);
	}

	add(input: Type, index?: number, inputId?: EntityId) {
		const id = inputId ?? this.createId();
		const ids = [...this.value.ids];
		if (index === undefined) {
			ids.push(id);
		} else {
			ids.splice(index, 0, id);
		}
		this.set({
			byId: {
				...this.value.byId,
				[id]: input,
			},
			ids,
		});

		return id;
	}

	createId() {
		return `l${newUid()}`;
	}

	fromEnd(offset: number = 0) {
		return this.value.ids[this.value.ids.length - offset - 1];
	}

	get(id: EntityId) {
		return this.value.byId[id];
	}

	indexOf(id: EntityId) {
		return this.value.ids.indexOf(id);
	}

	length() {
		return this.value.ids.length;
	}

	move(id: EntityId, distance: number) {
		const oldIndex = this.value.ids.indexOf(id);
		return this.moveTo(id, oldIndex + distance);
	}

	moveTo(id: EntityId, newIndex: number) {
		const ids = [...this.value.ids];
		const oldIndex = ids.indexOf(id);
		ids.splice(oldIndex, 1);
		ids.splice(newIndex, 0, id);
		this.set({
			...this.value,
			ids,
		});
		return ids;
	}

	remove(id: EntityId) {
		const byId = { ...this.value.byId };
		delete byId[id];

		const ids = [...this.value.ids];
		const idIndex = this.value.ids.indexOf(id);
		ids.splice(idIndex, 1);

		this.set({
			byId,
			ids,
		});
	}

	update(id: EntityId, value: Partial<Type>) {
		const updated = {
			...this.value.byId[id],
			...value,
		};

		this.set({
			...this.value,
			byId: {
				...this.value.byId,
				[id]: updated,
			},
		});

		return updated;
	}

	upsert(id: EntityId, value: Partial<Type>) {
		const existing = this.value.byId[id];
		if (existing !== undefined) {
			return this.update(id, value);
		} else {
			return this.add(value as Type, undefined, id);
		}
	}
}
