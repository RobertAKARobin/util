import { Component, routerContext } from '@robertakarobin/web/index.ts';

export const layout = new Component(
	(
		title: string,
		contents: string,
	) => {
		if (routerContext === `client`) { // TODO1: Move this to build, so client doesn't need to load below layout, and so the `document.title` part is included in lib
			document.title = title;
			return contents;
		}
		return `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<title>${title}</title>
				<script src="/script.js" type="module"></script>
				<link rel="stylesheet" href="/styles.css" />
			</head>
			<body>
				<div
					class="view"
					id="output"
				>${contents}</div>
			</body>
		</html>`;
	}
);
