<div class="callout"><b>Before you start:</b> keep a browser console open and run every example yourself — the point of each lesson is the practice, not the reading.</div>

JavaScript is the programming language of the web. Every interactive thing you've used in a browser — form validation, live search, drag and drop, the like button lighting up — is JavaScript at work.

## Where JavaScript runs

JavaScript started in the browser, but it long ago escaped it:

- **In the browser** — reacting to clicks, updating the page, talking to servers.
- **On servers** — Node.js runs JavaScript outside the browser, powering APIs and tools.
- **Everywhere else** — build scripts, mobile apps, even microcontrollers.

That reach is why it's such a good first language: one skill, many places to use it.

## What it's good at

JavaScript is *event-driven*. Instead of running top to bottom once and exiting, a JavaScript program mostly waits — for a click, a keystroke, a server response — and runs small pieces of code in response. You'll feel this shape in everything you build.

## Your very first line

Open your browser's DevTools console (`F12` or right-click → Inspect → Console) and type:

```js
console.log("Hello from Primer!");
```

Press Enter. The console prints your message immediately — no compiler, no setup, nothing to install. `console.log` is the tool you'll reach for constantly to see what your code is doing.

## What to remember

1. JavaScript makes web pages interactive, and also runs far beyond the browser.
2. Programs respond to *events* — they're mostly waiting, then reacting.
3. The console gives you instant feedback; it's the fastest place to try an idea.

When the console prints your greeting, mark this lesson complete — next we'll set up a proper workspace.
