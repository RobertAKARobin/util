export function findCommentsByContents(root: Node, contents: string, options: Partial<{
	limitTo: number;
}> = {}) {
	const newCommentIterator = () => document.createNodeIterator(
		root,
		NodeFilter.SHOW_COMMENT,
		() => NodeFilter.FILTER_ACCEPT,
	);
	const comments: Array<Comment> = [];

	let comment: Comment;
	let count = 0;
	const limit = options?.limitTo ?? Infinity;
	const iterator = newCommentIterator();
	while (count < limit) {
		comment = iterator.nextNode() as Comment;

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
