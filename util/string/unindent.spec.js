import { test } from '../spec/index.js';

import { unindent } from './unindent.js';

export const spec = test(import.meta.url, $ => {
	const subject = `	tab 1
no indent
		tab 2	tab in the middle
 space 1
  space 2
   space 3
	 tab 1 space 1
		  		tab 2 space 2 tab 2			trailing
`;
	$.assert(x => x(unindent(subject)) === `tab 1
no indent
tab 2	tab in the middle
space 1
space 2
space 3
tab 1 space 1
tab 2 space 2 tab 2			trailing
`);
});
