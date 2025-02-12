import { newUid } from '../uid.js';

import { Emitter } from './emitter.js';

/**
 * @typedef {number | string} EntityId
 */

/**
 * @template Type
 * @typedef {Type & { id: EntityId }} EntityWithId
 */

/**
 * @template Type
 * @typedef {{ byId: Record<EntityId, Type>; ids: Array<EntityId> }} EntityState
 */

/**
 * A collection of values ordered by both index and by ID
 * TODO1: Split of EntityState into own thing, then mixin Emitter?
 * @template {Record<EntityId, unknown>} Type
 * @augments {Emitter<EntityState<Type>>}
 */
export class EntityStateEmitter extends Emitter {

	byIndex = this.pipe(
		({ byId, ids }) => ids.map(id => ({
			...byId[id],
			id,
		})),
	).set([]);

	/**
	 * @param {ConstructorParameters<typeof Emitter<EntityState<Type>>>} args
	 */
	constructor(...args) {
		const [initial, options] = args;
		super(
			initial ?? {
				byId: {},
				ids: [],
			},
			options,
		);
	}

	/**
	 * Add the given entity at the given index and with the given ID, or generate an ID if none is given
	 * @param {Type} input
	 * @param {number} [index]
	 * @param {EntityId} [inputId]
	 * @returns {EntityId}
	 */
	add(input, index, inputId) {
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

	/**
	 * Generate a new entity ID
	 * @returns {string}
	 */
	createId() {
		return `l${newUid()}`;
	}

	/**
	 * Returns the entity ID at the given offset from the end of the list of IDs
	 * @param {number} [offset=0]
	 * @returns {EntityId}
	 */
	fromEnd(offset = 0) {
		return this.value.ids[this.value.ids.length - offset - 1];
	}

	/**
	 * Get an entity by its ID
	 * @param {EntityId} id
	 * @returns {Type}
	 */
	get(id) {
		return this.value.byId[id];
	}

	/**
	 * Returns the index of the given entity ID in the list of IDs
	 * @param {EntityId} id
	 * @returns {number}
	 */
	indexOf(id) {
		return this.value.ids.indexOf(id);
	}

	/**
	 * Returns the number of entities in the state
	 * @returns {number}
	 */
	length() {
		return this.value.ids.length;
	}

	/**
	 * Increment/decrement the index of the given entity by the given distance
	 * @param {EntityId} id
	 * @param {number} distance
	 * @returns {Array<EntityId>}
	 */
	move(id, distance) {
		const oldIndex = this.value.ids.indexOf(id);
		return this.moveTo(id, oldIndex + distance);
	}

	/**
	 * Change the index of the given entity
	 * @param {EntityId} id
	 * @param {number} newIndex
	 * @returns {Array<EntityId>}
	 */
	moveTo(id, newIndex) {
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

	/**
	 * Remove the entity with the given ID
	 * @param {EntityId} id
	 */
	remove(id) {
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

	/**
	 * Merge the given value into the entity with the given ID
	 * @param {EntityId} id
	 * @param {Partial<Type>} value
	 * @returns {Type}
	 */
	update(id, value) {
		if (id in this.value.byId === false) {
			throw new Error(`Entity with id '${id}' not found`);
		}

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

	/**
	 * Same as {@link update} but creates a new entity if one with the given ID doesn't exist
	 * @param {EntityId} id
	 * @param {Partial<Type>} value
	 * @ignore
	 */
	upsert(id, value) {
		const existing = this.value.byId[id];
		if (existing !== undefined) {
			return this.update(id, value);
		} else {
			return this.add(/** @type {Type} */(value), undefined, id);
		}
	}
}
