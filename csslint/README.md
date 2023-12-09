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
