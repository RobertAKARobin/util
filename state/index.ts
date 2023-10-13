export abstract class State<StateShape extends object> {
	get state() {
		return this.state_;
	}
	private state_: StateShape = {} as StateShape;

	constructor(
		private readonly key: string,
		private readonly getDefaults: (() => StateShape),
	) {
		this.set(this.getDefaults());
		this.load();
	}

	load() {
		const cachedState = JSON.parse(
			localStorage.getItem(this.key) || ``
		) as Partial<StateShape>;
		Object.assign(this.state_, cachedState);
	}

	reset() {
		this.set(this.getDefaults());
	}

	set(newState: Partial<StateShape>) {
		Object.assign(this.state_, newState);
		const cachedState = JSON.stringify(this.state_);
		localStorage.setItem(this.key, cachedState);
	}
}
