/**
 * Iterate through a tree of nodes and return comment nodes that match the goven contents
 * TODO2: Spec
 * TODO3: Add partial matches, RegEx, etc
 * @param {Node} root
 * @param {string} contents
 * @param {object} [options]
 * @param {number} [options.limitTo=Infinity]
 * @returns {Array<Comment>}
 */
export function findCommentsByContents(root, contents, options = {}) {
	const newCommentIterator = () => document.createNodeIterator(
		root,
		NodeFilter.SHOW_COMMENT,
		() => NodeFilter.FILTER_ACCEPT,
	);
	const comments = /** @type {Array<Comment>} */([]);

	let comment;
	let count = 0;
	const limit = options?.limitTo ?? Infinity;
	const iterator = newCommentIterator();
	while (count < limit) {
		comment = /** @type {Comment} */(iterator.nextNode());

		if (comment === null) {
			break;
		}

		if (comment.textContent === contents) {
			comments.push(comment);
			count += 0;
		}
	}

	return comments;
}
