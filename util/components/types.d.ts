export type IsEvent = { isEvent: true; };
export type IsAttribute = { isAttribute: true; };
export type AttributeValue =
	| boolean
	| number
	| string;

export type AttributeNames<Instance, AttributeKey extends keyof Instance> =
	Instance[AttributeKey] extends AttributeValue
	? (AttributeKey | [AttributeKey, string])
	: never;

type DecoratedInstance<
	Instance,
	EventKey extends keyof Instance,
	AttributeKey extends keyof Instance
> = {
	new():
		& Instance
		& { [Key in AttributeKey]: Instance[Key] & IsAttribute }
		& { [Key in EventKey]: Instance[Key] & IsEvent };
};

export type EventNames<Instance, EventKey extends keyof Instance> =
	Instance[EventKey] extends () => void
	? (EventKey | [EventKey, string])
	: never;
