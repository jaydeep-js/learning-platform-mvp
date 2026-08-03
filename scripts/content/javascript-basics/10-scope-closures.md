Scope is the answer to one question: *which variables can this line of code see?* Get scope, and closures — JavaScript's most famously "hard" topic — turn out to be one small extra step.

## Block scope

`let` and `const` live inside the nearest pair of braces:

```js
if (true) {
  const secret = 42;
}
console.log(secret);   // ReferenceError: secret is not defined
```

Functions create scope too, and scopes nest: inner code can see outward, but outer code can never see in.

```js
const app = "Primer";

function show() {
  const page = "lesson";
  console.log(app, page);   // sees both — looks outward
}

console.log(page);          // ReferenceError — can't look in
```

This is also `var`'s problem: `var` ignores blocks (only functions contain it), so a `var` inside an `if` leaks out. That leak is why modern code retired it.

## Closures: functions remember home

Here's the step that earns the fancy name. A function keeps access to the scope where it was *created* — even when it runs somewhere else, later:

```js
function makeCounter() {
  let count = 0;
  return () => {
    count = count + 1;
    return count;
  };
}

const next = makeCounter();
next()   // 1
next()   // 2
next()   // 3
```

`makeCounter` finished running long ago, but the arrow function it returned still sees `count` — its birthplace scope stays alive as long as the function does. That's a closure: **a function plus the variables it closed over.**

Notice what this gives you: `count` is genuinely private. Nothing outside `makeCounter` can read or reset it except through `next()`.

## Try it yourself

- Call `makeCounter()` twice into two variables and confirm the counters are independent.
- Write `makeGreeter(name)` that returns a function that returns `` `Hi, ${name}!` ``.
- Predict: does a closure copy the variable, or share it? Test by making two functions from the same `makeCounter` call's internals.

## What to remember

1. Braces are walls: inner sees outer, never the reverse.
2. A closure is a function that remembers the scope it was created in.
3. Closures give you private, long-lived state without any special syntax.
