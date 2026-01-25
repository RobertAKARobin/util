Components have a `.template` method which is subclassed to return a plain old string containing HTML, and a `.render` method which must be called to update the component's DOM.

In the HTML returned by `.template`, subcomponents are embedded using `MySubcomponent.id('foo')`. When `.id` is called it checks the DOM for an existing element with the given `[id]` and returns it, or creates a new instance with the given `[id]` and returns that. Then the subcomponent can be updated within the template by calling `.setAttributes`, or any custom methods, as long as the methods return the subcomponent instance, e.g. `return this`.

Naturally when the subcomponent instance appears in a string its `.toString()` method is called. `.toString()` has been overwritten such that it returns a "placeholder" element with the same `[id]` as the instance, e.g. `<placeholder id="foo" />`, and a `WeakRef` of the instance is cached in a `Map` in memory.

When `.render` is called, the component's `.template` is called and set as the `.innerHTML` of a temporary element that isn't attached to the DOM, called the "source". Then we walk down the source's DOM tree.

When we encounter a `<placeholder>` we replace it with its cached subcomponent. Then we continue on down the DOM tree, which now includes the updated subcomponent.

Finally we replace the root component's children with the source's children.

This allows the component to update its contents while preserving subcomponents inside it. However anything that isn't a subcomponent will be fully replaced.

TODO1: Switch to `template` from `div`
TODO1: Switch to comment from `<placeholder>`... Why did I switch to `placeholder` in the first place?
TODO1: Switch to declarative shadow DOM
TODO1: Switch to `DOMParser` from `innerHTML`
