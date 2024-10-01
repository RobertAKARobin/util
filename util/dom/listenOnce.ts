/**
 * Returns a Promise that resolves once the given event has occurred
 */
export function listenOnce<
	EventName extends keyof HTMLElementEventMap,
	EventType extends HTMLElementEventMap[EventName],
>(target: HTMLElement, eventName: EventName): Promise<EventType>;
export function listenOnce(target: EventTarget, eventName: string): Promise<Event>;
export function listenOnce(target: EventTarget, eventName: string) {
	return new Promise<Event>(resolve => {
		target.addEventListener(
			eventName,
			resolve as (event: Event) => void,
			{ once: true },
		);
	});
}
