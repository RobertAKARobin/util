import { sleep } from '../../time/sleep.ts';

type DBRecord = {
	id: number;
	name: string;
};

type DBRecordInput = Omit<DBRecord, `id`>;

/**
 * Little fake database/ORM to run tests against.
 * Represents an instance of a connection to a database.
 */
export class DB {
	private static readonly connections: Set<DB> = new Set();
	private static readonly data = new Map<number, DBRecord>();
	private static id = 0;

	static disconnect(db: DB) {
		db.isConnected_ = false;
		DB.connections.delete(db);
	}

	/**
	 * Fake network latency
	 */
	static async latency() {
		return sleep(10 * Math.random());
	}

	get isConnected() {
		return this.isConnected_;
	}

	private isConnected_ = false;


	constructor() {
		this.isConnected_ = true;
		DB.connections.add(this);
	}

	async assertConnection() {
		if (!this.isConnected_) {
			throw new Error(`Database is not connected`);
		}
		await DB.latency();
	}

	async create(recordInput: DBRecordInput) {
		await this.assertConnection();

		const record: DBRecord = {
			...recordInput,
			id: DB.id++,
		};
		DB.data.set(record.id, record);
		return record;
	}

	async createMany(recordInputs: Array<DBRecordInput>) {
		return Promise.all(
			recordInputs.map(recordInput => this.create(recordInput)),
		);
	}

	async delete(id: DBRecord[`id`]) {
		await this.has(id, { assert: true });
		DB.data.delete(id);
	}

	async deleteAll() {
		await this.assertConnection();
		DB.data.clear();
	}

	async deleteMany(ids: Array<Parameters<DB[`delete`]>[0]>) {
		await Promise.all(
			ids.map(id => this.delete(id)),
		);
	}

	disconnect() {
		if (!this.isConnected_) {
			throw new Error(`This connection is already disconnected.`);
		}
		return DB.disconnect(this);
	}

	async get(id: DBRecord[`id`]) {
		await this.has(id, { assert: true });
		return {
			...DB.data.get(id),
		};
	}

	async getIds() {
		await DB.latency();
		return Array.from(DB.data.keys());
	}

	async getMany(ids: Array<Parameters<DB[`get`]>>[0]) {
		return Promise.all(
			ids.map(id => this.get(id)),
		);
	}

	async has(id: DBRecord[`id`], options: Partial<{ assert: boolean; }> = {}) {
		await this.assertConnection();

		const exists = DB.data.has(id);
		if (options?.assert !== undefined && !exists) {
			throw new Error(`ID '${id}' is not present in database.`);
		}
		return exists;
	}

	async update(id: DBRecord[`id`], recordInput: DBRecordInput) {
		await this.has(id, { assert: true });

		const record = {
			...recordInput,
			id,
		};
		DB.data.set(id, record);
		return record;
	}

	async updateMany(entries: Array<Parameters<DB[`update`]>>) {
		return Promise.all(
			entries.map(([id, recordInput]) => this.update(id, recordInput)),
		);
	}
}
