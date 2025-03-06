export type AttributeConfig<Value=string> = {
	fromAttribute?: (value: string | null) => Value;
	name?: string;
	observed?: boolean;
	toAttribute?: (value: Value) => string;
};

export type EventFlag = { isEvent: true; };

export type EventHandlerTest<
	Listener,
	HandlerKey extends keyof Listener,
	EventDetail,
> =
	Listener[HandlerKey] extends (event: CustomEvent<EventDetail>) => void
	? HandlerKey
	: never;

export type EventNameConfig<Instance, EventKey extends keyof Instance> =
	Instance[EventKey] extends () => void
	? (EventKey | [EventKey, string])
	: never;

export type EventNameTest<Instance, EventKey extends keyof Instance> =
	Instance[EventKey] extends EventFlag
	? EventKey
	: never;
