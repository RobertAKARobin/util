import { execSync, spawn } from 'child_process';
import fs from 'fs';
import http from 'http';

import { mimeFor, mimeMap } from '../web/mime';
import { tryCatch } from '../tryCatch';


class Server extends http.Server {
	host = `localhost`;
	port = 8000;
	server = http.createServer(this.receive.bind(this));

	close() {
		server.closeAllConnections();
	}

	receive() {
		if (typeof request.url === `undefined`) {
			return this.close();
		}
	}

	receivePOST() {
		if (request.method?.toUpperCase() !== `POST`) {
			return;
		}

		request.setEncoding(`utf8`);

		let json = ``;
		request.on(`data`, (data: string) => json += data);
		request.on(`end`, () => {
			const result = JSON.parse(json) as Type.SuiteResult;
			result.title = specFile;

			results.push(result);
			specFileIndex += 1;

			// response.writeHead(200);
			// response.end();
		});
	}

	respondHTML() {
		response.writeHead(200, { 'Content-Type': mimeMap.html });
		response.end(/*html*/`
<!DOCTYPE html>
<html>
	<head>
		<title>Title</title>
		</head>
	<body>Body</body>
</html>
		`);
	}

	respondStatic() {
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

	start(options: {
		host?: Server[`host`];
		port?: Server[`port`];
	} = {}) {
		this.host = options.host ?? this.host;
		this.port = options.port ?? this.port;

		this.server.listen(this.port, this.port);
	}
}
