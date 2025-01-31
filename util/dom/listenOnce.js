/**
 * Returns a Promise that resolves once the given event has occurred
 * @template {keyof HTMLElementEventMap} EventName
 * @template {HTMLElementEventMap[EventName]} EventType
 * @overload
 * @param {HTMLElement} target
 * @param {EventName} eventName
 * @returns {Promise<EventType>}
 */
/**
 * @overload
 * @param {EventTarget} target
 * @param {string} eventName
 * @returns {Promise<Event>}
 */
/**
 * @param {EventTarget} target
 * @param {string} eventName
 * @returns {Promise<Event>}
 */
export function listenOnce(target, eventName) {
	return new Promise(resolve => {
		target.addEventListener(
			eventName,
			resolve,
			{ once: true },
		);
	});
}
