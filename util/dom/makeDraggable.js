/**
 * @import { Coordinate } from '../2d/types.d';
 */

import { pointToSvg } from '../svg/pointToSvg.js';

export const customDragEventName = `customdrag`;

// TODO1: Spec

export class CustomDragEvent extends Event {
	/**
	 * The current coordinates of the pointer
	 * @type {Coordinate}
	 * @readonly
	 */
	pointer;
	/**
	 * The current coordinates of the pointer offset by the difference between the {@link CustomDragEvent.targetOrigin} and {@link CustomDragEvent.pointerOrigin}
	 * @type {Coordinate}
	 * @readonly
	 */
	pointerOffset;
	/**
	 * The coordinates of the pointer when the mouse was pressed
	 * @type {Coordinate}
	 * @readonly
	 */
	pointerOrigin;
	/**
	 * The coordinates of the target when the mouse was pressed, using  `getBoundingClientRect`
	 * @type {Coordinate}
	 * @readonly
	 */
	targetOrigin;

	/**
	 * @param {Pick<CustomDragEvent, 'pointer' | 'pointerOffset' | 'pointerOrigin' | 'targetOrigin'>} detail
	 */
	constructor(detail) {
		super(customDragEventName, { bubbles: false });
		this.pointer = detail.pointer;
		this.pointerOffset = detail.pointerOffset;
		this.pointerOrigin = detail.pointerOrigin;
		this.targetOrigin = detail.targetOrigin;
	}
};

/**
 * Makes the given element emit a `customdrag` event on mousemove after it has emitted a mousedown, until mouseup.
 * TODO1: Spec
 * @param {Element} target
 * @param {object} [options]
 * @param {'center' | 'top left'} [options.offsetOrigin]
 * @returns {AbortController}
 */
export function makeDraggable(target, options = {}) {
	const abort = new AbortController();
	const signal = abort.signal;

	let isDragging = false;
	/** @type {Coordinate} */
	let pointerOrigin;
	/** @type {Coordinate} */
	let targetOrigin;
	target.addEventListener(`mousedown`, _event => { // TODO3: With `target: HTMLElement | SVGGeometryElement`, why is this still just `Event`?
		const event = /** @type {MouseEvent} */(_event);
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
		if (isDragging === false) {
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
			const svgRoot = /** @type {SVGSVGElement} */(target.ownerSVGElement);
			const svgCoordinates = pointToSvg(svgRoot, [
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

