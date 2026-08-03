Single values only get you so far. Real data comes in groups — a list of lessons, a user with a name and an email. Arrays hold *lists*; objects hold *labeled collections*.

## Arrays: ordered lists

```js
const units = ["Getting started", "Variables", "Functions", "Control flow"];

units[0]         // "Getting started" — positions count from 0
units.length     // 4
units.push("Bonus unit");   // add to the end
```

The zero-based indexing trips everyone up once: the first item is `[0]`, and the last is `[units.length - 1]`.

Arrays come with a toolbox of methods you'll use every day. The two to meet first:

```js
const minutes = [6, 8, 10, 12];

const doubled = minutes.map(m => m * 2);      // [12, 16, 20, 24]
const short = minutes.filter(m => m < 10);    // [6, 8]
```

`map` transforms every item; `filter` keeps the items that pass a test. Both return *new* arrays and leave the original untouched.

## Objects: labeled values

```js
const topic = {
  name: "JavaScript Basics",
  lessons: 13,
  level: "beginner",
};

topic.name           // "JavaScript Basics"
topic["level"]       // "beginner" — bracket form for dynamic keys
topic.mins = 200;    // add a new property
```

An object is a bundle of `key: value` pairs. Where an array answers "what's at position 3?", an object answers "what's the *level*?".

## They nest

Almost all real data is arrays of objects, objects holding arrays, and so on:

```js
const unit = {
  title: "Getting started",
  items: [
    { title: "What is JavaScript?", mins: 6 },
    { title: "Your first script", mins: 10 },
  ],
};

unit.items[1].title   // "Your first script"
```

Read chains like that from left to right: *unit → its items → position 1 → its title*.

## Try it yourself

- Make an array of your three favorite foods and log the last one using `length`.
- Build an object describing this lesson (title, minutes, done) and log one property.
- Use `map` to turn `[6, 8, 10]` into `["6m", "8m", "10m"]`.

## What to remember

1. Arrays are ordered and zero-indexed; objects are labeled.
2. `map` and `filter` return new arrays — reach for them before writing loops.
3. Real data nests; read access chains left to right.
