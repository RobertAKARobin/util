/**
 * Naive UID generator
 * TODO3: Better UID generator. Doesn't have to actually be unique, just unlikely to repeat within app
 * @returns {string}
 */
export function newUid() {
	return Math.random().toString(36).slice(-5);
}
