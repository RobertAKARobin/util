import type { Coordinate } from '../types.d.ts';
import { pointToSvg } from '../svg/pointToSvg.ts';

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
		super(customDragEventName, { bubbles: false });
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
	options: {
		offsetOrigin?: `center` | `top left`;
	} = {},
) {
	const abort = new AbortController();
	const signal = abort.signal;

	let isDragging = false;
	let pointerOrigin: Coordinate;
	let targetOrigin: Coordinate;
	target.addEventListener(`mousedown`, _event => { // TODO3: With `target: HTMLElement | SVGGeometryElement`, why is this still just `Event`?
		const event = _event as unknown as MouseEvent;
		event.stopPropagation();
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

	target.ownerDocument.addEventListener(`mouseup`, event => {
		event.stopPropagation();
		isDragging = false;
	}, { signal });

	const offsetOrigin = options.offsetOrigin ?? `top left`;
	target.ownerDocument.addEventListener(`mousemove`, event => {
		if (!isDragging) {
			return;
		}

		event.stopPropagation();

		const pointer = {
			x: event.clientX,
			y: event.clientY,
		};
		const pointerOffset = {
			x: pointer.x - (pointerOrigin.x - targetOrigin.x),
			y: pointer.y - (pointerOrigin.y - targetOrigin.y),
		};

		if (offsetOrigin === `center`) {
			const bounds = target.getBoundingClientRect();
			pointerOffset.x += (bounds.width / 2);
			pointerOffset.y += (bounds.height / 2);
		}

		if (target instanceof SVGGeometryElement) {
			const svgCoordinates = pointToSvg(target.ownerSVGElement!, [
				pointerOffset.x,
				pointerOffset.y,
			]);
			pointerOffset.x = svgCoordinates.x;
			pointerOffset.y = svgCoordinates.y;
		}

		const dragEvent = new CustomDragEvent({
			pointer,
			pointerOffset,
			pointerOrigin,
			targetOrigin,
		});
		target.dispatchEvent(dragEvent);
	}, { signal });

	return abort;
}

