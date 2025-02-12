/**
 * @import * as Type from './types.d';
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import http from 'http';

import { mimeFor, mimeMap } from '../../web/mime.js';
import { tryCatch } from '../../tryCatch.js';

import { count } from '../index.js';

const specHost = `localhost`;
const specPort = 8001;
const specRoutes = {
	next: `/spec`,
	report: `/report`,
	root: `/`,
};
const staticDir = `util`;

/** @type {Type.SpecRunner} */
export const specRunWeb = (
	specFiles,
	options, // TODO2: Better way of passing options to the front-end... What if they aren't serializable?
) => new Promise(resolve => {
	const results = /** @type {Array<Type.SuiteResult>} */([]);
	let specFileIndex = 0;

	const server = http.createServer((request, response) => {
		if (typeof request.url === `undefined`) {
			return close();
		}

		const specFile = specFiles[specFileIndex];

		switch (request.url) {
			case specRoutes.root: {
				response.writeHead(200, { 'Content-Type': mimeMap.html });
				response.end(/*html*/`
<!DOCTYPE html>
<html>
	<head>
		<title>Spec ${specFileIndex}</title>
		<script type="module">
		import { spec } from '${specRoutes.next}';
		if (typeof spec !== 'function') {
			close();
		}

		const result = await spec({}, ${JSON.stringify(options)});
		// console.log(render(result));

		await fetch('${specRoutes.report}', {
			body: JSON.stringify(result),
			method: 'POST',
		});

		location.href = '${specRoutes.root}';
		</script>
	</head>
	<body>Spec ${specFileIndex}</body>
</html>
					`);
				break;
			}

			case specRoutes.next: {
				if (specFile === undefined) {
					response.writeHead(200, { 'Content-Type': mimeMap.js });
					response.end(`const spec = undefined; export { spec }`);
					return close();
				}

				// TODO1: Extract out build step
				const spec = execSync(`esbuild ${specFile} --format=esm --bundle=true`); // Using esbuild's CLI because it requires less finagling than the Node import. TODO1: This re-compiles util/spec on each iteration, though it was already compiled above. How to resuse? --external keeps esbuild from translating `.ts` imports to `.js`
				response.writeHead(200, { 'Content-Type': mimeMap.js });
				response.end(spec);
				break;
			}

			case specRoutes.report: {
				if (request.method?.toUpperCase() !== `POST`) {
					return;
				}

				request.setEncoding(`utf8`);

				let json = ``;
				request.on(`data`, data => json += data);
				request.on(`end`, () => {
					// TODO3: https://github.com/typescript-eslint/typescript-eslint/issues/1682
					const result = /** @type {Type.SuiteResult} */(JSON.parse(json)); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
					result.title = specFile;

					results.push(result);
					specFileIndex += 1;

					response.writeHead(200);
					response.end();
				});

				break;
			}

			default: {
				const staticPath = `${staticDir}${request.url}`;

				if (fs.existsSync(staticPath) === false) {
					response.writeHead(404);
					response.end();
					break;
				}

				const staticContents = tryCatch(() => fs.readFileSync(staticPath));

				if (staticContents instanceof Error) {
					response.writeHead(500);
					response.end(staticContents);
					break;
				}

				const mimeType = mimeFor(staticPath);
				response.writeHead(200, { 'Content-Type': mimeType });
				response.end(staticContents);
			}
		}
	});

	server.listen(specPort, specHost);

	const chrome = spawn(`/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome`, [
		`http://${specHost}:${specPort}${specRoutes.root}`,
		`--auto-open-devtools-for-tabs`,
		`--incognito`,
		`--allow-file-access-from-files`,
		`--allow-external-pages`,
		`--user-data-dir=tmp`, // Forces a new/local instance of Chrome with data stored in `./dist`
	]);

	function close() {
		chrome.stdin.end(); // https://stackoverflow.com/questions/18694684/spawn-and-kill-a-process-in-node-js#comment135166575_18694940
		chrome.kill(`SIGKILL`);

		server.closeAllConnections();

		const resultCount = count(...results);
		resolve({
			indexAtDefinition: 0,
			iterations: [{
				children: results,
				indexAtDefinition: 0,
				type: `suiteIteration`,
				...resultCount,
			}],
			timing: `consecutive`,
			title: `web`,
			type: `suite`,
			...resultCount,
		});
	}
});
