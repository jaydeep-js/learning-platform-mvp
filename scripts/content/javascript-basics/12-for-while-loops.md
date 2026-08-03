Loops repeat work so you don't have to. JavaScript has several, and choosing the right one is mostly about what you're looping *over*.

## for...of — the everyday loop

When you have an array, this is the loop you want:

```js
const units = ["Getting started", "Variables", "Functions", "Control flow"];

for (const unit of units) {
  console.log(`Unit: ${unit}`);
}
```

No counters, no off-by-one errors — you get each item, in order, done.

## The classic for — when you need the index

```js
for (let i = 0; i < units.length; i++) {
  console.log(`${i + 1}. ${units[i]}`);
}
```

Three slots: *start* (`let i = 0`), *keep going while* (`i < units.length`), *step* (`i++`). Reach for it when the position matters — numbering lessons, stepping by twos, walking two arrays in parallel.

## while — loop until something changes

`while` doesn't count; it repeats as long as a condition holds:

```js
let pct = 20;
while (pct < 100) {
  pct = pct + 20;
  console.log(`Now at ${pct}%`);
}
```

<div class="callout"><b>Infinite-loop insurance:</b> something inside a <code>while</code> must move the condition toward false. If your page freezes, you forgot — close the tab, find the line that never changes, fix it.</div>

## break and continue

- `break` exits the loop immediately.
- `continue` skips to the next iteration.

```js
for (const unit of units) {
  if (unit === "Functions") break;      // stop entirely
  if (unit.length < 10) continue;       // skip short names
  console.log(unit);
}
```

## Or skip the loop entirely

Remember `map` and `filter` from the arrays lesson? Most "transform this list" loops are clearer as array methods. Loops shine when you're *doing* something repeatedly rather than *building* a new list.

## Try it yourself

- Sum `[6, 8, 10, 12, 18]` with a `for...of` loop, then again with `reduce`.
- Print lessons "01." through "13." with a classic `for` (pad single digits with a zero).
- Use `while` to repeatedly halve 200 until it drops below 10, logging each step.

## What to remember

1. `for...of` for items, classic `for` for indexes, `while` for conditions.
2. Every `while` needs a line that moves it toward stopping.
3. If the goal is a new array, consider `map`/`filter` before looping.
