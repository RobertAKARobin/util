import path from 'path';

import localPlugin from './rules/index.js';

for (const ruleName in localPlugin.rules) {
	console.log(`>>> test rule ${ruleName}`);
	void import(path.join(import.meta.dirname, `rules`, `${ruleName}.test.js`));
}
