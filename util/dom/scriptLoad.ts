/**
 * Asynchronously loads a script by attaching it to the `<head>`
 */
export function scriptLoad(src: string) {
	return new Promise<Event>(resolve => {
		const script = document.createElement(`SCRIPT`);
		script.onload = resolve;
		document.head.appendChild(script);
		script.setAttribute(`src`, src);
	});
}
