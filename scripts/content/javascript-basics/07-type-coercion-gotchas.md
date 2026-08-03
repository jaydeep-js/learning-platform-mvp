JavaScript tries hard to make different types work together. Usually that's convenient — sometimes it's a trap. This lesson is about seeing the traps coming.

## The classic surprise

```js
"2" + 1    // "21"  — + with a string means concatenation
"2" - 1    // 1     — - only works on numbers, so "2" converts
```

The same string behaves differently depending on the operator. Rule of thumb: **`+` prefers strings, every other math operator prefers numbers.**

## == versus ===

Double equals compares *after* converting types; triple equals compares *without* converting:

```js
1 == "1"     // true  — the string is coerced first
1 === "1"    // false — different types, done

0 == false   // true (!)
0 === false  // false
```

<div class="callout"><b>House rule:</b> always use <code>===</code> and <code>!==</code>. The coercing forms save four keystrokes and cost hours of debugging. Every serious style guide agrees on this one.</div>

## Truthiness

Conditions convert their value to a boolean. Exactly these six values are *falsy*:

- `false`
- `0`
- `""` (empty string)
- `null`
- `undefined`
- `NaN`

Everything else — including `"0"`, `[]`, and `{}` — is *truthy*. This is genuinely useful for guards like `if (name) { ... }`, as long as you remember the list.

## Converting on purpose

When you mean to convert, say so explicitly:

```js
Number("42")     // 42
String(42)       // "42"
Boolean("")      // false
Number("42px")   // NaN — "not a number", and NaN !== NaN
```

`NaN` is what numeric conversion produces when it fails. Check for it with `Number.isNaN(x)`, never with `===`.

## Try it yourself

- Predict, then verify: `"5" * "2"`, `"5" + 2`, `5 + true`.
- Log `Boolean([])` and `[] == false`. Welcome to why we use `===`.
- Convert the string `"3.14"` to a number and add 1.

## What to remember

1. `+` concatenates when either side is a string; other operators coerce to numbers.
2. Use `===` always; know the six falsy values.
3. Convert explicitly with `Number()`, `String()`, `Boolean()`.
