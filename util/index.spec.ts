import { execSync, spawn } from 'child_process';
import { glob } from 'glob';
import http from 'http';
import path from 'path';
import url from 'url';

import { print, suite, type Type } from './spec/index.ts';
import { promiseConsecutive } from './time/promiseConsecutive.ts';
import { substringBetween } from './string/substringBetween.ts';
import type { SuiteResult } from './spec/src/types.d.ts';

const extensions = {
	spec: `.spec.ts`,
	specWeb: `.spec.web.ts`,
};

const targets = process.argv.slice(2);

const fileNames = await glob(
	targets.length === 0 ? `*/**/*.ts` : targets,
	{
		ignore: [
			`dist/**/*`,
			`example/**/*`,
			`util/browser.spec.ts`,
			`util/index.spec.ts`,
			`util/const/**/*`,
			`util/spec/example/**/*`, // Run by spec/spec.spec.ts
			`util/svg/**/*`,
			`**/node_modules/**/*`,
			`**/*.d.ts`,
		],
	},
);
const files = new Set(fileNames.sort());

const specFilesByPlatform = {
	node: [] as Array<string>,
	web: [] as Array<string>,
};
const specWithoutSource = [] as Array<string>;
const sourceWithoutSpec = [] as Array<string>;
const thisFile = url.fileURLToPath(import.meta.url);

for (const file of files) {
	if (path.resolve(file) === thisFile) {
		continue;
	}

	if (file.includes(`.spec`)) {
		if (file.endsWith(extensions.specWeb)) {
			specFilesByPlatform.web.push(file);
		} else {
			specFilesByPlatform.node.push(file);
		}

		const base = substringBetween(file, { end: /\.spec/ });
		if (files.has(`${base}.ts`) === false) {
			specWithoutSource.push(file);
		}
	} else {
		const base = substringBetween(file, { end: /\.ts/ });
		let hasSpec = false;
		for (const extension of Object.values(extensions)) {
			if (files.has(`${base}${extension}`)) {
				hasSpec = true;
			}
		}
		if (hasSpec === false) {
			sourceWithoutSpec.push(file);
		}
	}
}

console.log(`>>> Specs without source:`);
console.log(specWithoutSource.map((entry, index) =>
	`${index}.\t${entry}\n`,
).join(``));

console.log(`>>> Sources without spec:`);
console.log(sourceWithoutSpec.map((entry, index) =>
	`${index}.\t${entry}\n`,
).join(``));

const specs = await promiseConsecutive(
	specFilesByPlatform.node.sort().map(file => async() => {
		const { spec } = await import(file) as {
			spec: typeof Type.Test;
		};
		if (typeof spec !== `function`) {
			throw new Error(file);
		}
		return spec;
	}),
);

export const spec = suite(`@robertakarobin/util/`, {
	timing: `consecutive`,
}, ...specs);
const basedir = `file://` + process.cwd();

const rootResult = await spec({});
print(rootResult, {
	exit: false,
	format: (result, text) => {
		if (result.type === `suite` || result.type === `test`) {
			if (typeof text[0] === `string`) {
				text[0] = text[0].replace(basedir, ``);
			}
		}

		if (rootResult.status === `pass`) {
			if (result.type === `suite` || result.type === `test`) {
				return text;
			}

			return [``];
		}

		if (`status` in result && result.status === `fail`) {
			return text;
		}

		return [``];
	},
	verbose: true,
});

const specHost = `localhost`;
const specPort = 8001;
const specRoutes = {
	next: `/spec`,
	report: `/report`,
	root: `/`,
};
const results: Array<SuiteResult> = [];

void await new Promise<void>(resolve => {
	const specFiles = specFilesByPlatform.web;
	let specFileIndex = 0;

	const server = http.createServer((request, response) => {
		if (typeof request.url === `undefined`) {
			return close();
		}

		switch (request.url) {
			case specRoutes.root: {
				response.writeHead(200, { 'Content-Type': `html` });
				response.end(`
<!DOCTYPE html>
<html>
	<head>
		<title>Spec ${specFileIndex}</title>
		<script type="module">
		import { spec } from '${specRoutes.next}';
		if (typeof spec !== 'function') {
			close();
		}
		const result = await spec({});
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
				const spec = execSync(`esbuild ${specFile} --format=esm --bundle=true`);
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
				request.on(`data`, (data: string) => {
					const result = JSON.parse(data) as SuiteResult;
					print(result, { verbose: true });
					results.push(result);
				});

				response.writeHead(200);
				response.end();
				break;
			}

			default: {
				response.writeHead(200);
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
		`--user-data-dir=dist`,
	]);

	function close() {
		chrome.stdin.end();
		chrome.kill(`SIGKILL`);
		server.closeAllConnections();
		resolve();
		process.exit();
	}
});
