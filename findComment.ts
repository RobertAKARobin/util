export function findCommentsByContents(root: Node, contents: string) {
	const newCommentIterator = () => document.createNodeIterator(
		root,
		NodeFilter.SHOW_COMMENT,
		() => NodeFilter.FILTER_ACCEPT,
	);
	const comments: Array<Comment> = [];

	let comment: Comment;
	const iterator = newCommentIterator();
	while (true) {
		comment = iterator.nextNode() as Comment;

		if (comment === null) {
			break;
		}

		if (comment.textContent === contents) {
			comments.push(comment);
		}
	}

	return comments;
}
