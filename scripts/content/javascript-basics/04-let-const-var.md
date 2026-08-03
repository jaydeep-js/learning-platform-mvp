JavaScript gives you three keywords for declaring variables. Two of them you'll use daily; one you need to recognize in older code.

## const first, let when needed

```js
const platform = "Primer";   // can never be reassigned
let progress = 20;           // can be reassigned later

progress = 35;               // fine
platform = "Other";          // TypeError: Assignment to constant variable
```

The modern habit is simple: **declare everything with `const`**, and switch to `let` only when you genuinely need to reassign. This makes your code easier to read — a `let` is a signal that the value changes somewhere below.

## What about var?

`var` is the original keyword from 1995. It still works, but it has looser scoping rules that cause subtle bugs (you'll see exactly why in the *Scope & closures* lesson). You'll meet `var` in older tutorials and codebases — read it as "an old `let`" and don't write new code with it.

## Naming things

Variable names can't contain spaces and can't start with a digit. The JavaScript convention is *camelCase*:

```js
const lessonCount = 13;
const currentUnitTitle = "Variables & data types";
const isComplete = false;
```

Names are for humans. `lessonCount` costs nothing more to type than `lc`, and six weeks from now only one of them will still make sense.

## Try it yourself

- Declare a `const` for your name and a `let` for your age, then log both.
- Try reassigning the `const` and read the error message carefully.
- Declare a variable with `let` but no value, and log it. You'll see `undefined` — the value of "nothing here yet".

## What to remember

1. Default to `const`; use `let` only when the value must change.
2. Treat `var` as legacy — recognize it, don't write it.
3. camelCase names, written for the human who reads them next.
