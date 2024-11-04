import { execSync, spawn } from 'child_process';
import http from 'http';

import { count } from '../index.ts';

import type * as Type from './types.d.ts';

const specHost = `localhost`;
const specPort = 8001;
const specRoutes = {
	next: `/spec`,
	report: `/report`,
	root: `/`,
};

export const specRunWeb: Type.SpecRunner = (
	specFiles,
	options,
) => new Promise(resolve => {
	const results: Array<Type.SuiteResult> = [];
	let specFileIndex = 0;

	const optionsForBrowser = JSON.stringify(options); // TODO2: Better way to pass in options/arguments... What if arguments aren't serializable?

	const server = http.createServer((request, response) => {
		if (typeof request.url === `undefined`) {
			return close();
		}

		switch (request.url) {
			case specRoutes.root: {
				response.writeHead(200, { 'Content-Type': `html` });
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
		const result = await spec({}, ${optionsForBrowser});
		console.log(result.status);
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
				const specFile = specFiles[specFileIndex];
				if (specFile === undefined) {
					response.writeHead(200, { 'Content-Type': `text/javascript` });
					response.end(`const spec = undefined; export { spec }`);
					return close();
				}

				console.log(specFile);
				// TODO1: Extract out build step
				const spec = execSync(`esbuild ${specFile} --format=esm --bundle=true`); // Using esbuild's CLI because it requires less finagling than the Node import
				response.writeHead(200, { 'Content-Type': `text/javascript` });
				response.end(spec);

				specFileIndex += 1;
				break;
			}

			case specRoutes.report: {
				if (request.method?.toUpperCase() !== `POST`) {
					return;
				}

				request.setEncoding(`utf8`);

				let json = ``;
				request.on(`data`, (data: string) => json += data);
				request.on(`end`, () => {
					const result = JSON.parse(json) as Type.SuiteResult;
					results.push(result);
					response.writeHead(200);
					response.end();
				});

				break;
			}

			default: {
				response.writeHead(200); // TODO1: Serve static files
				response.end(`foo`);
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
		`--user-data-dir=dist`, // Forces a new/local instance of Chrome with data stored in `./dist`
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
