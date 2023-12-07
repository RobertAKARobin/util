# Goals

-	Use code as the test description, so:
	-	No need for a domain-specific language for comparisons (e.g. `assert(x).greaterThan(y)`)
	-	No worries about the text of the test not matching its actual functionality
-	Easy to print the actual and expected values
-	Easy to write, with type safety and autocompletion
-	Easy to customize, also without a DSL
-	Usable on FE or BE
-	Easy to shuffle test order
-	Easy to run tests concurrently or consecutively
-	No weird async stuff with shared state between tests

## Concepts

Each SpecContext has two phases:

1.	Definition
2.	Execution

Specs are made of "SpecSteps":

Component | When run? | # times run? | Children | Shuffleable?
-|-|-|-|-
Suite | Definition | 1 per SpecContext | Suites, Tests | Yes
Test | Execution | Any | Assertions | Yes
Assertion | Execution | 1 per test | - | No

## Notes

-	Any reason to allow `log`s as a child of `suite`s? e.g. `suite('foo', test(), log(), test()...)`
	-	Wouldn't make a lot of sense since suites can be shuffled. Only real use-case is probably loggng something about args, which should just go in `args`?
-	What should be in output?
	-	Suite definition (args)
	-	Suite child (suite or test)
	-	Test definition
	-	Test child (assertion or log)
	-	Assertion
-	Tried functional approach, but prototypal works better because:
	-	Better for letting users subclass and define their own methods
	-	Lots of adding things to existing objects and sharing of properties between objects
-	A suite's `args` should be run once _per iteration_, not once for the whole suite, because otherwise:
	-	Would allow tests to possibly share state
	-	If we want `args` to run once for the whole suite, can just wrap the suite in another suite with `args`
-	Require test files to be explicitly imported, or glob-import them?
	-	Explicit
		-	+: More granular control of order
		-	+: More granular control of handling results
		-	-: More boilerplate
		-	+: Not bound to `.spec` file extensions
-	Spec step
	-	Spec step factory
	-	Spec step definition
	-	Spec step
	-	Spec step iteration

## TODO

-	Can log from within args
-	Exit with proper exit code
-	Shuffle
-	Catch errors?
-	Print as you go
-	Deferred tests
-	Make `suite()` support no options
-	Add caching, e.g. for valueWrapMatcher
-	Suppress iteration details; assertions should not count toward total if in suppressed iteration (but failures should still override status)
-	Verify results are POJOs
-	Dollar sign as valueWrapper gets a `2` appended to it?
-	Add examples with more complex assertionhelper names

### Done

-	Async assertions
-	Pass render options to `print` and `render`
-	Bind `suite` and `test` in constructor
-	Add status indicators to right of prefix
-	Test against expected output
-	How to render arguments that are longer than 1 line? Diffing would be nice, but has overhead
-	Right-align totals
-	Logs shouldn't be numbered
-	Assertions shouldn't be async because otherwise they execute out of order unless they're all explicitly awaited
-	Errors in assertions should be handled the same as assertions in tests
-	Error count is off
-	Spaces in explanations are getting removed
	-	Can't fix: we use `assertion.toString()` which strips unnecessary whitespace
-	Summarize iterations if not different
	-	Switching to "if not errored", since that's a lot easier and probably sufficient anyway
-	Coerce to an Error anything that is thrown but uncaught?
-	Error if assertion doesn't return boolean
-	Show error under assertion title, if applicable
-	Suppress iteration prefix if only iteration
-	Error handling for suite args
-	Extract iteration function
-	Prepend status indicator again
-	Show indicator to right of prefix
-	Throw error if attempting to put suite or test inside of another test
	-	Not really necessary -- they just don't do anything
-	Suppress timing
