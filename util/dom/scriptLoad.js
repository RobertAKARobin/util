/**
 * Asynchronously loads a script by attaching it to the `<head>`
 * @param {string} src
 * @returns {Promise<Event>}
 */
export function scriptLoad(src) {
	return new Promise((resolve, reject) => {
		const script = document.createElement(`SCRIPT`);
		script.onload = resolve;
		script.onerror = reject;
		document.head.appendChild(script);
		script.setAttribute(`src`, src);
	});
}
