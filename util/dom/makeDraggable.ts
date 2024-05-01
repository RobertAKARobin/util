export const customDragEventName = `customdrag`;

/**
 * Makes the given element emit a `customdrag` event on mousemove after it has emitted a mousedown, until mouseup.
 */
export function makeDraggable(target: SVGElement) {
	const abort = new AbortController();
	const signal = abort.signal;

	let isDragging = false;
	target.addEventListener(`mousedown`, () => isDragging = true, { signal });
	target.ownerDocument.addEventListener(`mouseup`, () => isDragging = false, { signal });
	target.ownerDocument.addEventListener(`mousemove`, event => {
		if (!isDragging) {
			return;
		}

		target.dispatchEvent(new MouseEvent(customDragEventName, { ...event }));
	}, { signal });

	return abort;
}
