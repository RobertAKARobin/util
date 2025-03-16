/**
 * @import * as Type from './types.d';
 */

import fs from 'fs';
import http from 'http';
import { spawn } from 'child_process';

import { mimeFor, mimeMap } from '../../web/mime.js';
import { tryCatch } from '../../tryCatch.js';

import { count } from '../index.js';

const specHost = `localhost`;
const specPort = 8001;
const specRoutes = {
	report: `/report`,
	root: `/`,
};
const staticDir = `util`;

/** @type {Type.SpecRunner} */
export const specRunWeb = (
	specFilesNames,
	options, // TODO2: Better way of passing options to the front-end... What if they aren't serializable?
) => new Promise(resolve => {
	const results = /** @type {Array<Type.SuiteResult>} */([]);
	let specFileIndex = 0;
	let specFileName = ``;

	const server = http.createServer((request, response) => {
		switch (request.url) {
			case specRoutes.root: {
				let specFileName = specFilesNames[specFileIndex];
				if (specFileName === undefined) {
					return close();
				}

				console.log(specFileName);

				specFileName = specFileName.replace(new RegExp(`^${staticDir}`), ``);

				response.writeHead(200, { 'Content-Type': mimeMap.html });
				response.end(/*html*/`
<!DOCTYPE html>
<html>
	<head>
		<title>Spec ${specFileIndex}</title>
		<script type="module">
		import { spec } from './${specFileName}';

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
					result.title = specFileName;

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
