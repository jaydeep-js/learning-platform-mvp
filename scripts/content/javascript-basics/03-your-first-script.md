<div class="callout"><b>Before you start:</b> have the <code>primer-js</code> folder from the last lesson open, with Live Server running and the console visible.</div>

Every lesson on Primer follows the same rhythm: a short explanation of the idea, a worked example you follow along with, and a small exercise to prove it stuck. This one is no different.

## The idea

Programs are just instructions executed in order. Before worrying about syntax, get comfortable with the shape of the workflow: write a small piece of code, run it, read what happens, adjust. That loop — *write, run, read, adjust* — is the actual skill. The language details attach themselves to it with practice.

Replace the contents of `app.js` with:

```js
console.log("Hello from Primer!");

let lessonsFinished = 2;
console.log("Lessons finished: " + lessonsFinished);
```

Save, and read the console. Two things just happened. You told the machine to print a message, and it did — immediately. Then you stored a number in a *variable* and printed a sentence built from it. Storing values and combining them is most of what programs do.

## Try it yourself

- Change the message inside the quotes and save again.
- Make `lessonsFinished` a bigger number. What prints now?
- Remove the quotes around the first message and read the error. Errors are information, not judgment.

## Reading your first error

That last exercise produced something like `ReferenceError: Hello is not defined`. The browser is telling you exactly what confused it: without quotes, `Hello` looks like a variable name it's never seen. Quotes mean *text*; no quotes means *code*. This distinction will follow you through the whole language.

## What to remember

1. Code runs top to bottom, one instruction at a time.
2. Variables store values; `console.log` shows them to you.
3. Reading errors calmly is half the job — they always point somewhere real.
