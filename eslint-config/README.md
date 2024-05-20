# Robin's ESLint

This package is named `@robertakarobin/eslint-config` instead of just `@robertakarobin/eslint` [because ESLint says so](https://eslint.org/docs/latest/extend/shareable-configs#creating-a-shareable-config).

## Why not Prettier?

We're not using Prettier because it's too much of a PITA, especially when supporting custom templates like `.astro`.

## Styleguide

The philosophy is that a "rule" is only a rule if it can be caught by an automated linter.

Rules that we haven't found lint rules for yet:

-	When you have to use quotes when declaring an object property name, use single quotes.

-	Use `data-` attributes to select elements, not CSS classes.

-	Use the global namespace when calling global variables. This makes it clearer where the variable is coming from.

	Yes:
	```js
	window.location
	```

	No:
	```js
	location
	```
