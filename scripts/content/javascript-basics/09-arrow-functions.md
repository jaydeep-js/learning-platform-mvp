Arrow functions are the compact, modern way to write functions — and the form you'll see most in real codebases, especially as arguments to `map`, `filter`, and event handlers.

## From function to arrow

These three are equivalent:

```js
function double(n) {
  return n * 2;
}

const double = (n) => {
  return n * 2;
};

const double = n => n * 2;   // the short form
```

The last line shows the two shortcuts that make arrows shine:

- **One parameter?** The parentheses are optional.
- **Body is a single expression?** Drop the braces and the `return` — the expression's value is returned implicitly.

## Where arrows earn their keep

Passing behavior to other functions is where the short form pays off:

```js
const minutes = [6, 8, 10, 12, 18];

minutes.map(m => m * 2)          // [12, 16, 20, 24, 36]
minutes.filter(m => m >= 10)     // [10, 12, 18]
minutes.reduce((a, b) => a + b)  // 54 — summing the list
```

Compare that with writing `function (m) { return m * 2; }` inline three times. Same meaning, half the noise.

## When you still need braces

The implicit return only works for a *single expression*. The moment you need multiple statements, bring back braces and `return`:

```js
const label = mins => {
  const hours = Math.floor(mins / 60);
  return hours ? `${hours}h` : `${mins}m`;
};
```

<div class="callout"><b>One more difference:</b> arrow functions don't get their own <code>this</code> — they inherit it from where they're written. That's usually what you want, and it matters mostly in code you'll meet later (classes, event handlers). File it away for now.</div>

## Try it yourself

- Rewrite your `double` and `isPassing` functions from last lesson as one-line arrows.
- Use `filter` with an arrow to keep only strings longer than 5 characters from `["primer", "js", "lesson", "go"]`.
- Chain it: `map` those survivors to uppercase.

## What to remember

1. `const f = x => x * 2` — parentheses and braces are optional in the short cases.
2. Arrows are the idiomatic choice for `map`/`filter`/callbacks.
3. Multiple statements need braces *and* an explicit `return`.
