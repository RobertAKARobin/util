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
	}

	createId() {
		return newUid();
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
		this.next({
			...this.last,
			byId: {
				...this.last.byId,
				[id]: {
					...this.last.byId[id],
					...value,
				},
			},
		});
	}

	upsert(id: string, value: Partial<Type>) {
		const existing = this.last.byId[id];
		if (existing !== undefined) {
			this.update(id, value);
		} else {
			this.add(value as Type, id);
		}
	}
}
