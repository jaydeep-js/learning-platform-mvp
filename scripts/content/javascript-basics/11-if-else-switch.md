Programs make decisions. `if` is how JavaScript expresses them, and `switch` is the specialized tool for one value with many cases.

## if / else if / else

```js
const pct = 64;

if (pct >= 100) {
  console.log("Completed — nice work!");
} else if (pct > 0) {
  console.log(`${pct}% done — keep going.`);
} else {
  console.log("Not started yet.");
}
```

The branches are checked top to bottom and **exactly one runs**. Order matters: put the most specific condition first, or a broader one above it will swallow its cases.

## The ternary: if as an expression

When a decision just picks between two *values*, the ternary operator fits on one line:

```js
const cta = pct > 0 ? "Continue" : "Start";
```

Read it as *condition ? value-if-true : value-if-false*. Perfect for labels and defaults; wrong for anything with side effects or nesting — that's `if` territory.

## switch: one value, many cases

```js
switch (level) {
  case "beginner":
    label = "Beginner";
    break;
  case "intermediate":
    label = "Intermediate";
    break;
  case "advanced":
    label = "Advanced";
    break;
  default:
    label = "Unknown";
}
```

`switch` compares with `===` against each `case`.

<div class="callout"><b>The classic bug:</b> forgetting <code>break</code>. Without it, execution <em>falls through</em> into the next case and keeps going. If a switch ever behaves bizarrely, check the breaks first.</div>

## Combining conditions

`&&` (and), `||` (or), and `!` (not) build compound tests:

```js
if (pct > 0 && pct < 100) { /* in progress */ }
if (level === "beginner" || mins < 60) { /* easy pick */ }
```

`&&` and `||` short-circuit: they stop evaluating as soon as the answer is known. You'll see `user && user.name` used as a guard because of exactly this.

## Try it yourself

- Write a function that returns `"short"`, `"medium"`, or `"long"` for a lesson's minutes (under 10, under 16, otherwise).
- Rewrite it as a chain of ternaries. Which reads better? (Opinions differ — have one.)
- Build a `switch` on a day-of-week string that logs whether it's a weekend.

## What to remember

1. `if` chains run exactly one branch; order from specific to general.
2. Ternaries are for choosing values, not running logic.
3. `switch` needs its `break`s; `&&`/`||` short-circuit.
