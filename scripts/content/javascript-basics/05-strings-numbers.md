Text and numbers are the raw material of almost every program. JavaScript calls them *strings* and *numbers*, and each comes with tools you'll use constantly.

## Strings

A string is text wrapped in quotes. Single and double quotes are equivalent; *backticks* are the powerful third option:

```js
const name = "Aditi";
const topic = 'JavaScript Basics';
const greeting = `Welcome back, ${name}!`;   // template literal
```

The backtick form is a **template literal** — the `${...}` slot embeds any value or expression directly in the text. It replaces fiddly `+` concatenation and handles most string-building you'll ever do.

Strings know things about themselves:

```js
name.length          // 5
name.toUpperCase()   // "ADITI"
topic.includes("Basics")  // true
```

## Numbers

JavaScript has one number type that covers integers and decimals:

```js
const lessons = 13;
const rating = 4.8;
const total = lessons * 3;     // 39
const half = 7 / 2;            // 3.5 — no separate integer division
```

Useful companions live on `Math`:

```js
Math.round(4.6)   // 5
Math.floor(4.6)   // 4
Math.max(3, 9, 5) // 9
```

<div class="callout"><b>Heads up:</b> decimals are stored in binary, so <code>0.1 + 0.2</code> prints <code>0.30000000000000004</code>. Every language with binary floats does this — round for display, and never compare decimals with <code>===</code> directly.</div>

## Try it yourself

- Build a sentence with a template literal that embeds a calculation: `` `You have ${13 - 2} lessons left` ``.
- Take your name and log it in all caps, then log its length.
- Log `0.1 + 0.2` and then `Math.round((0.1 + 0.2) * 100) / 100`.

## What to remember

1. Prefer template literals for building text.
2. One number type; `Math` holds the utilities.
3. Binary decimals are imprecise — round when it matters.
