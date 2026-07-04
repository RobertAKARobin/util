/**
 * Asynchronously loads a script by attaching it to the `<head>`
 * TODO1: Spec
 * @param {string} src
 * @returns {Promise<Event>}
 */
export function scriptLoad(src) {
	return new Promise(resolve => {
		const script = document.createElement(`SCRIPT`);
		script.onload = resolve;
		document.head.appendChild(script);
		script.setAttribute(`src`, src);
	});
}
