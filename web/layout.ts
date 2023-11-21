import { type LayoutArgs } from './build.ts';

export default (input: LayoutArgs) => `
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>${input.page.title}</title>
		<base href="/">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		${typeof (input.mainJsPath) === `string`
			? `<script src="${input.mainJsPath}" type="module"></script>`
			: ``
		}

		${typeof (input.mainCssPath) === `string`
			? `<link rel="stylesheet" href="${input.mainCssPath}">`
			: ``
		}

		${typeof (input.head) === `string`
			? `<head>${input.head}</head>`
			: ``
		}

		${typeof input.routeCssPath === `string`
			? `<link rel="stylesheet" href="${input.routeCssPath}">`
			: ``
		}

		${[...input.subclasses.values()].map(Subclass => `
			<style ${Subclass.$elAttribute}="${Subclass.name}"></style>
		`).join(`\n`)}
	</head>

	${typeof (input.body) === `string`
		? `<body>${input.body}</body>`
		: ``
	}
</html>
`;
