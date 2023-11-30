import { Emitter } from './emitter.ts';
import { newUid } from './index.ts';

export type EntityState<Type> = {
	byId: Record<string, Type>;
	ids: Array<string>;
};

export class EntityStateEmitter<Type>
	extends Emitter<EntityState<Type>> {

	entries = this.pipe(({ ids, byId }) => ids.map(id => ({
		...byId[id],
		id,
	})));

	constructor(
		...[input]: ConstructorParameters<typeof Emitter<EntityState<Type>>>
	) {
		const options: typeof input = {
			...input,
			initial: input?.initial ?? {
				byId: {},
				ids: [],
			},
		};
		super(options);
	}

	add(input: Type, inputId?: string) {
		const id = inputId ?? this.createId();

		this.next({
			...this.last,
			byId: {
				...this.last.byId,
				[id]: input,
			},
			ids: [
				...this.last.ids,
				id,
			],
		});

		return id;
	}

	createId() {
		return newUid();
	}

	fromEnd(offset: number = 0) {
		return this.last.ids[this.last.ids.length - offset - 1];
	}

	get(id: string) {
		return this.last.byId[id];
	}

	indexOf(id: string) {
		return this.last.ids.indexOf(id);
	}

	length() {
		return this.last.ids.length;
	}

	move(id: string, distance: number) {
		const oldIndex = this.last.ids.indexOf(id);
		return this.moveTo(id, oldIndex + distance);
	}

	moveTo(id: string, newIndex: number) {
		const ids = [...this.last.ids];
		const oldIndex = ids.indexOf(id);
		ids.splice(oldIndex, 1);
		ids.splice(newIndex, 0, id);
		this.next({
			...this.last,
			ids,
		});
		return ids;
	}

	remove(id: string) {
		const byId = { ...this.last.byId };
		delete byId[id];

		const ids = [...this.last.ids];
		const idIndex = this.last.ids.indexOf(id);
		ids.splice(idIndex, 1);

		this.next({
			...this.last,
			byId,
			ids,
		});
	}

	update(id: string, value: Partial<Type>) {
		const updated = {
			...this.last.byId[id],
			...value,
		};

		this.next({
			...this.last,
			byId: {
				...this.last.byId,
				[id]: updated,
			},
		});

		return updated;
	}

	upsert(id: string, value: Partial<Type>) {
		const existing = this.last.byId[id];
		if (existing !== undefined) {
			return this.update(id, value);
		} else {
			return this.add(value as Type, id);
		}
	}
}
