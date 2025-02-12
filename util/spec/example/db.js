import { sleep } from '../../time/sleep.js';

/**
 * @typedef {{ id: number; name: string }} DBRecord
 * @typedef {Omit<DBRecord, 'id'>} DBRecordInput
 */

/**
 * Little fake database/ORM to run tests against.
 * Represents an instance of a connection to a database.
 */
export class DB {
	/**
	 * @readonly
	 */
	static #connections = /** @type {Set<DB>} */(new Set());

	/**
	 * @readonly
	 */
	static #data = /** @type {Map<number, DBRecord>} */(new Map());

	static #id = 0;

	static disconnect(/** @type {DB} */db) {
		db.#isConnected = false;
		DB.#connections.delete(db);
	}

	// Fake network latency
	static async latency() {
		return sleep(10 * Math.random());
	}

	get isConnected() {
		return this.#isConnected;
	}

	#isConnected = false;


	constructor() {
		this.#isConnected = true;
		DB.#connections.add(this);
	}

	async assertConnection() {
		if (this.#isConnected === false) {
			throw new Error(`Database is not connected`);
		}
		await DB.latency();
	}

	async create(/** @type {DBRecordInput} */recordInput) {
		await this.assertConnection();

		const record = /** @type {DBRecord} */({
			...recordInput,
			id: DB.#id++,
		});
		DB.#data.set(record.id, record);
		return record;
	}

	async createMany(/** @type {Array<DBRecordInput>} */recordInputs) {
		return Promise.all(
			recordInputs.map(recordInput => this.create(recordInput)),
		);
	}

	async delete(/** @type {DBRecord['id']} */id) {
		await this.has(id, { assert: true });
		DB.#data.delete(id);
	}

	async deleteAll() {
		await this.assertConnection();
		DB.#data.clear();
	}

	async deleteMany(/** @type {Array<Parameters<DB['delete']>[0]>} */ids) {
		await Promise.all(
			ids.map(id => this.delete(id)),
		);
	}

	disconnect() {
		if (this.#isConnected === false) {
			throw new Error(`This connection is already disconnected.`);
		}
		return DB.disconnect(this);
	}

	async get(/** @type {DBRecord['id']} */id) {
		await this.has(id, { assert: true });
		return {
			...DB.#data.get(id),
		};
	}

	async getIds() {
		await DB.latency();
		return Array.from(DB.#data.keys());
	}

	async getMany(/** @type {Array<DBRecord['id']>} */ids) {
		return Promise.all(
			ids.map(id => this.get(id)),
		);
	}

	async has(
		/** @type {DBRecord['id']} */id,
		/** @type {{ assert?: boolean }} */options = {},
	) {
		await this.assertConnection();

		const exists = DB.#data.has(id);
		if (options?.assert !== undefined && exists === false) {
			throw new Error(`ID '${id}' is not present in database.`);
		}
		return exists;
	}

	async update(
		/** @type {DBRecord['id']} */id,
		/** @type {DBRecordInput} */recordInput,
	) {
		await this.has(id, { assert: true });

		const record = {
			...recordInput,
			id,
		};
		DB.#data.set(id, record);
		return record;
	}

	async updateMany(
		/** @type {Array<[DBRecord['id'], DBRecordInput]>} */entries,
	) {
		return Promise.all(
			entries.map(([id, recordInput]) => this.update(id, recordInput)),
		);
	}
}
