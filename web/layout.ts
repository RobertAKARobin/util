import { type LayoutArgs } from './build.ts';

/**
 * The default layout used to render static HTML files for SSG routes
 */
export const defaultLayout = (input: LayoutArgs) => `
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>${input.page.value.title}</title>
		<base href="${input.baseHref}">

		${typeof input.meta === `string`
			?	input.meta
			: `<meta name="viewport" content="width=device-width, initial-scale=1">`
		}

		${typeof input.mainJsPath === `string`
			? `<script src="${input.mainJsPath}" type="module"></script>`
			: ``
		}

		${typeof input.mainCssPath === `string`
			? `<link rel="stylesheet" href="${input.mainCssPath}">`
			: ``
		}

		${typeof input.head === `string`
			? input.head
			: ``
		}

		${typeof input.routeCssPath === `string`
			? `<link rel="stylesheet" href="${input.routeCssPath}">`
			: ``
		}

		${typeof input.loadScript === `string`
			? `<script>${input.loadScript}</script>`
			: ``
		}

		${[...input.Component.subclasses.values()].map(Subclass => /* These keep Component.ts from loading the CSS twice; see Componet.setStyle */`
			<style ${Subclass.$elAttrType}="${Subclass.name}"></style>
		`).join(``)}
	</head>

	${typeof input.body === `string`
		? `<body>${input.body}</body>`
		: ``
	}
</html>
`;
