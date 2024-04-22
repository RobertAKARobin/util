/**
 * Returns a Promise that resolves once the given event has occurred
 */
export function listenOnce<
	EventName extends keyof HTMLElementEventMap,
	EventType extends HTMLElementEventMap[EventName],
>(element: HTMLElement, eventName: EventName): Promise<EventType>;
export function listenOnce<
	EventName extends keyof ElementEventMap,
	EventType extends ElementEventMap[EventName],
>(element: Element, eventName: EventName): Promise<EventType> {
	return new Promise<EventType>(resolve => {
		element.addEventListener(
			eventName,
			resolve as (event: Event) => void,
			{ once: true }
		);
	});
}
