/**
 * Find all commment nodes within a node tree
 * @param {Node} root
 * @param {object} [options]
 * @param {(comments: Array<Comment>) => boolean} [options.endCondition]
 * @returns {Array<Comment>}
 */
export function findComments(root, options = {}) {
	const comments = /** @type {Array<Comment>} */([]);
	const iterator = (() => document.createNodeIterator(
		root,
		NodeFilter.SHOW_COMMENT,
		() => NodeFilter.FILTER_ACCEPT,
	))();
	const endCondition = options.endCondition ?? (() => false);

	/** @type {Comment | null} */
	let comment;
	while (true) {
		comment = /** @type {Comment} */(iterator.nextNode());

		if (comment === null || endCondition(comments)) {
			break;
		}

		comments.push(comment);
	}

	return comments;
}
