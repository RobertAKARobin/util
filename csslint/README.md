# CSS Linting

Some preferences and their reasons:

-	Put classes in alphabetical order.

	Otherwise everyone kind-of comes up with their own order. Alphabetical isn't perfect, but at least it's consistent.

-	Prefix scoped/component classes with `_`.

	This way it's easier to tell in HTML whether a class is global or local.

-	In HTML, put scoped/component classes after global classes

	e.g. `<div class="global _local">`. Local classes should override global classes.

-	Deep-nesting selectors is OK.

	[It probably has little if any performance impact](https://medium.com/developer-rants/the-problem-1f121f6aecbf), it's DRYer, and also it's nice when the indentation of the CSS reflects the indentation of the content.

-	Put properties for different states in different blocks, instead of overriding.

	It makes it much clearer which properties belong to which state, and prevents the confusion that lots of overrides can cause. It comes at the cost of a little verbosity.

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
