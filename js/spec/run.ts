import * as path from 'path';

import $ from '.';

void (async function() {
	const filePaths = process.argv.slice(2);

	await Promise.all(
		filePaths.map((filePath) => {
			return import(path.join(process.env.PWD, filePath));
		})
	);

	console.log(JSON.stringify($, null, `  `));

	console.log(JSON.stringify(await $.run(), null, `  `));

	// console.log((await $.run()).toString());
})();
