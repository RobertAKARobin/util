# Goals

- Use code as the test description, so:
    - No need for a domain-specific language for comparisons (e.g. `assert(x).greaterThan(y)`)
    - No worries about the text of the test not matching its actual functionality
- Easy to print the actual and expected values
- Easy to write, with type safety and autocompletion
- Easy to customize, also without a DSL
- Usable on FE or BE

## Concepts

Each SpecContext has two phases:

1. Definition
2. Execution

Component | When run? | # times run? | Children | Shuffleable?
-|-|-|-|-
Suite | Definition | 1 per SpecContext | Suites, Tests | Yes
Test | Execution | Any | Assertions | Yes
Assertion | Execution | 1 per test | - | No

## Notes

- Tried functional approach, but prototypal works better because:
    - Better for letting users subclass and define their own methods
    - Lots of adding things to existing objects and sharing of properties between objects
