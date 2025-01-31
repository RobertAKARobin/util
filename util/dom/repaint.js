/**
 * Force the browser to repaint the current window and synchronously wait for it to finish.
 */
export function repaint() {
	document.body.offsetHeight; // https://stackoverflow.com/a/64001548/2053389
}
