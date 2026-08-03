A function is a named piece of code you can run whenever you like, with whatever inputs you like. Functions are how programs stop being one long script and start being built from parts.

## Anatomy

```js
function formatMinutes(mins) {
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return hours ? `${hours}h ${rest}m` : `${rest}m`;
}

formatMinutes(45)    // "45m"
formatMinutes(200)   // "3h 20m"
```

Four parts to see clearly:

1. **The name** — `formatMinutes`, a verb-ish description of what it does.
2. **Parameters** — `mins`, the placeholder for whatever value the caller passes in.
3. **The body** — the statements between the braces.
4. **`return`** — the value handed back to the caller. Execution stops there.

## Return early, return often

A function without a `return` gives back `undefined`. And `return` doesn't have to be last — returning early keeps logic flat:

```js
function levelLabel(level) {
  if (level === "beginner") return "Beginner";
  if (level === "advanced") return "Advanced";
  return "Intermediate";
}
```

## Parameters can have defaults

```js
function greet(name = "learner") {
  return `Welcome back, ${name}!`;
}

greet()          // "Welcome back, learner!"
greet("Aditi")   // "Welcome back, Aditi!"
```

## Why functions matter

Notice what `formatMinutes` did: it gave a *name* to an idea used all over this site (every topic card shows durations like "3h 20m"). Write it once, test it once, use it everywhere. When the formatting rule changes, you change one place.

## Try it yourself

- Write `double(n)` that returns its input times two.
- Write `lessonSummary(title, mins)` that returns `` `${title} — ${mins}m` ``.
- Write `isPassing(score)` that returns `true` for 50 and above — using exactly one line in the body.

## What to remember

1. Functions take inputs (parameters), do work, and `return` an output.
2. No `return` means `undefined`; early returns keep code flat.
3. A good function names an idea you'd otherwise repeat.
