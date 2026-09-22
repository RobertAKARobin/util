import { test } from '../spec/index.js';

import { findComments } from './findComment.js';

const subject = /*html*/`
<div id="root">
	<ul>
		<li>
			<!--aaa-->
		</li>

		<li>
			<!-- bbb-->
		</li>

		<li>
			<!--ccc-->
		</li>

		<li>
			<!--ddd -->
		</li>
	</ul>
</div>
`;

export const spec = test(import.meta.url, $ => {
	document.body.innerHTML += subject;
	const root = /** @type {HTMLElement} */(document.getElementById(`root`));

	let comments = findComments(root);
	$.assert(x => x(comments.length) === 4);

	comments = findComments(root, {
		endCondition: comments => comments.length >= 2,
	});
	$.assert(x => x(comments.length) === 2);
	$.assert(x => x(comments.map(comment => comment.textContent).join(`;`)) === `aaa; bbb`);
});
