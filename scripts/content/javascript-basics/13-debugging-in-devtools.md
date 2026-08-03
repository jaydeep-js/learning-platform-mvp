You've written real code in twelve lessons — which means you've also written real bugs. This final lesson is about finding them methodically instead of staring harder.

## Read the error like a map

Every console error carries three clues:

```text
Uncaught TypeError: Cannot read properties of undefined (reading 'title')
    at lessonSummary (app.js:12)
    at app.js:20
```

- **The type** — `TypeError` means a value wasn't what an operation needed.
- **The message** — something was `undefined`, and code tried to read `.title` off it.
- **The trace** — it happened at `app.js` line 12, which was called from line 20. Click the link; DevTools jumps there.

Errors point at where the code *failed*, which is downstream of where it went *wrong*. The `undefined` was created somewhere earlier — the trace tells you where to start walking back.

## console.log strategically

Logging is legitimate debugging. Do it with intent:

```js
console.log("before filter", { lessons });
const short = lessons.filter(l => l.mins < 10);
console.log("after filter", { short });
```

Wrapping values in `{ braces }` logs them with their names. Log *before and after* the line you suspect, and the lie reveals itself.

## Breakpoints: pause the world

For anything beyond two logs, use the debugger. In DevTools → *Sources*, open your file and click a line number. Reload. Execution freezes there, and you can:

- Hover any variable to see its current value.
- **Step over** (`F10`) to run the current line and pause on the next.
- Watch the *Scope* panel — it's the scope chain from lesson 10, live.

<div class="callout"><b>Try it now:</b> put a breakpoint inside any loop from the last lesson and step through three iterations. Watching variables change beats any explanation of loops ever written.</div>

## A debugging ritual

1. Reproduce it — find the exact steps that trigger the bug.
2. Read the error and jump to the line.
3. Form one hypothesis: "I think `x` is undefined here because…"
4. Test it with a log or breakpoint. No guessing without checking.
5. Fix, re-run, confirm the error is gone — and that nothing else broke.

## What to remember

1. Error messages are maps: type, message, and a clickable trace.
2. Log before/after the suspect line, with named values.
3. Breakpoints let you watch state change — the debugger is the truth.

That's the whole topic. Mark this complete, and JavaScript Basics is done — DOM Essentials is the natural next step, where this language finally touches the page.
