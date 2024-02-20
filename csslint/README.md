# CSS Linting

-	Put everything (properties and classes) in alphabetical order.

	Otherwise everyone comes up with their own order. Alphabetical isn't perfect, but at least it's consistent.

-	Nest all the things.

	Deep nesting [probably has little if any performance impact](https://medium.com/developer-rants/the-problem-1f121f6aecbf), it's DRYer, and also it's nice when the indentation of the CSS reflects the indentation of the content.

-	In the HTML `class` attribute, order classes by (1) whether they're related, (2) global before local, then (3) alphabetically.

	The order in the HTML `class` attribute [doesn't actually matter](https://stackoverflow.com/a/15672815/2053389).

	```html
	<div class="button -high _submit -active"></div>
	```

-	Class naming

	We use kind-of a light version of [BEM](https://getbem.com/introduction/) that trades a small risk of class collisions for brevity: we don't use the compound class names defined by BEM because they're annoyingly verbose, especially without a CSS pre-processor.

	Proper BEM:

	```html
	<header class="_head">
		<h1 class="_head__title _head__title--icon">
			<i class="-head__title__icon"></i>
		</h1>
	</header>
	```

	We're OK with this:

	```html
	<header class="_head">
		<h1 class="_title -icon">
			<i class="_icon"></i>
		</h1>
	</header>
	```

	Differences:

	-	If you're targeting an element that could only possibly be 1 specific HTML tag, target it with the tag name. Otherwise use a CSS class.

		```css
		._hero {
			& ._image {} /* Bad: The hero is probably only ever going to have a single <img> inside it, so `& img` is fine */
			& img {} /* Good */
		}

		._header {
			& h1 {} /* Bad: A header could contain an h2, h3, h4... */
			& ._title {} /* Good */
		}
		```

	-	camelCase identifiers that are multiple words

		CSS ignores casing in CSS class names, so `.fooBar` is functionally the same as `.foobar` and `.FOOBAR`. But camelCasing is visually helpful for developers and the odds of it introducing a class name collision is remote.

		Do this:

		```html
		<li class="listItem_title"></li>
		```

		Don't do this:

		```html
		<li class="list-item__title"></li>
		```

	-	Prefix scoped/component/local classes with `_`

		These are classes which only make sense within the context of a particular component or block.

		```css
		.head {
			& ._title {}
			& ._subtitle {}
		}
		```

		...as opposed to global classes which can be used throughout an application:

		```css
		.button {}
		.modal {}
		```

	-	Prefix variants/modifiers with `-`

		Classes which should only be used in conjunction with another class, describing a variant of it.

		```css
		.button {
			& .-high {}
			& .-low {}
		}
		.field {
			& .-text {
				& .-numeric {}
			}
		}
		```

-	Put properties for different states in different blocks, instead of overriding.

	It's much clearer which properties belong to which state, and prevents the confusion that lots of overrides can cause. It comes at the cost of a little verbosity.

	For example, consider a nav bar is vertical on larger viewports and horizontal on smaller viewports.

	Don't do this:

	```css
	.nav {
		background: #fff;
		display: flex;
		flex-direction: column;

		@media (smaller) {
			flex-direction: row;
		}
	}
	```

	Do this:

	```css
	.nav {
		background: #fff;

		@media (smaller) {
			display: flex;
			flex-direction: row;
		}

		@media (bigger) {
			display: flex;
			flex-direction: column;
		}
	}
	```

	Note that since `display: flex` is declared by both states _could_ be put in the base class, but the `flex-direction` properties don't really make sense without the context of `display: flex`, so semantically it's better as written.
