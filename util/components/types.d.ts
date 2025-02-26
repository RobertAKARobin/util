export type IsEvent = { isEvent: true; };
export type IsAttribute = { isAttribute: true; };
export type AttributeValue =
	| boolean
	| number
	| string;

export type AttributeNames<Instance, AttributeKey> =
	Instance[AttributeKey] extends AttributeValue
	? (AttributeKey | [AttributeKey, string])
	: never;

export type EventNames<Instance, EventKey> =
	Instance[EventKey] extends () => void
	? (EventKey | [EventKey, string])
	: never;

