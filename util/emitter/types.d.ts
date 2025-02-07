import type { Emitter, IGNORE } from './emitter';

export type EmitterCacheOptions = {
	limit?: number;
};

export type EmitterOptions<State> = EmitterCacheOptions & {
	emitOnInit?: boolean;
	formatter?: Emitter<State>[`formatter`];
	reset?: Emitter<State>[`resetter`];
};

export type EmitEvent<State> = [
	State,
	{
		emitter: Emitter<State>;
		previous: State;
	},
];

export type EntityId = number | string;

export type EntityWithId<Type> = Type & {
	id: EntityId;
};

export type EntityState<Type> = {
	byId: Record<EntityId, Type>;
	ids: Array<EntityId>;
};

export type PipeFunction<StateInput, StateOutput> = (
	...event: SubscriptionEvent<StateInput>
) => StateOutput | typeof IGNORE;

export type Subscription<State> = {
	emitter: WeakRef<Emitter<State>>;
	unsubscribe: () => void;
};

export type SubscriptionEvent<State> = [
	State,
	{
		emitter: Emitter<State>;
		handler: SubscriptionHandler<State>;
		previous: State;
	},
];

export type SubscriptionHandler<State> = (...event: SubscriptionEvent<State>) => void;
