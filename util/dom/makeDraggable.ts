import type { Coordinate } from 'util/types.d.ts';

export const customDragEventName = `customdrag`;

export class CustomDragEvent extends Event {
	/**
	 * The current coordinates of the pointer
	 */
	readonly pointer: Coordinate;
	/**
	 * The current coordinates of the pointer offset by the difference between the {@link targetOrigin} and {@link pointerOrigin}
	 */
	readonly pointerOffset: Coordinate;
	/**
	 * The coordinates of the pointer when the mouse was pressed
	 */
	readonly pointerOrigin: Coordinate;
	/**
	 * The coordinates of the target when the mouse was pressed, using  `getBoundingClientRect`
	 */
	readonly targetOrigin: Coordinate;

	constructor(detail: Pick<CustomDragEvent,
		| `pointer`
		| `pointerOffset`
		| `pointerOrigin`
		| `targetOrigin`
	>) {
		super(customDragEventName);
		this.pointer = detail.pointer;
		this.pointerOffset = detail.pointerOffset;
		this.pointerOrigin = detail.pointerOrigin;
		this.targetOrigin = detail.targetOrigin;
	}
};

declare global {
	interface GlobalEventHandlersEventMap { // eslint-disable-line no-restricted-syntax
		customdrag: CustomDragEvent;
	}
};

/**
 * Makes the given element emit a `customdrag` event on mousemove after it has emitted a mousedown, until mouseup.
 */
export function makeDraggable(
	target: Element,
	callback?: (event: CustomDragEvent) => unknown,
) {
	const abort = new AbortController();
	const signal = abort.signal;

	let isDragging = false;
	let pointerOrigin: Coordinate;
	let targetOrigin: Coordinate;
	target.addEventListener(`mousedown`, _event => { // TODO3: With `target: HTMLElement | SVGGeometryElement`, why is this still just `Event`?
		const event = _event as unknown as MouseEvent;
		const targetBounds = target.getBoundingClientRect();
		pointerOrigin = {
			x: event.clientX,
			y: event.clientY,
		};
		targetOrigin = {
			x: targetBounds.x,
			y: targetBounds.y,
		};
		isDragging = true;
	}, { signal });

	target.ownerDocument.addEventListener(`mouseup`, () => isDragging = false, { signal });

	target.ownerDocument.addEventListener(`mousemove`, event => {
		if (!isDragging) {
			return;
		}

		const pointer = {
			x: event.clientX,
			y: event.clientY,
		};
		const pointerOffset = {
			x: pointer.x - (pointerOrigin.x - targetOrigin.x),
			y: pointer.y - (pointerOrigin.y - targetOrigin.y),
		};
		const dragEvent = new CustomDragEvent({
			pointer,
			pointerOffset,
			pointerOrigin,
			targetOrigin,
		});
		target.dispatchEvent(dragEvent);

		if (typeof callback === `function`) {
			callback(dragEvent);
		}
	}, { signal });

	return abort;
}

