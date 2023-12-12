import { Emitter } from './emitter.ts';
import { newUid } from './uid.ts';

export type EntityState<Type> = {
	byId: Record<string, Type>;
	ids: Array<string>;
};

export class EntityStateEmitter<Type extends Record<string, unknown>>
	extends Emitter<EntityState<Type>> {

	entries = this.pipe(({ ids, byId }) => ids.map(id => byId[id]));

	constructor(
		...[initial, actions, options]: ConstructorParameters<typeof Emitter<EntityState<Type>>>
	) {
		super(
			initial ?? {
				byId: {},
				ids: [],
			},
			actions,
			options,
		);
	}

	add(input: Type, index?: number, inputId?: string) {
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
		return newUid();
	}

	fromEnd(offset: number = 0) {
		return this.value.ids[this.value.ids.length - offset - 1];
	}

	get(id: string) {
		return this.value.byId[id];
	}

	indexOf(id: string) {
		return this.value.ids.indexOf(id);
	}

	length() {
		return this.value.ids.length;
	}

	move(id: string, distance: number) {
		const oldIndex = this.value.ids.indexOf(id);
		return this.moveTo(id, oldIndex + distance);
	}

	moveTo(id: string, newIndex: number) {
		const ids = [...this.value.ids];
		const oldIndex = ids.indexOf(id);
		ids.splice(oldIndex, 1);
		ids.splice(newIndex, 0, id);
		this.set({ ids });
		return ids;
	}

	remove(id: string) {
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

	update(id: string, value: Partial<Type>) {
		const updated = {
			...this.value.byId[id],
			...value,
		};

		this.set({
			byId: {
				...this.value.byId,
				[id]: updated,
			},
		});

		return updated;
	}

	upsert(id: string, value: Partial<Type>) {
		const existing = this.value.byId[id];
		if (existing !== undefined) {
			return this.update(id, value);
		} else {
			return this.add(value as Type, undefined, id);
		}
	}
}
