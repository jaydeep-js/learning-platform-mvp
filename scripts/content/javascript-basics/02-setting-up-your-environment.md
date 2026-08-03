You can learn a lot in the console, but real projects live in files. This lesson sets up a minimal, professional workspace: an editor, a browser, and a folder.

## The three tools

- **An editor** — Visual Studio Code is the standard choice. Install it, then add the *Live Server* extension (it reloads your page as you save).
- **A browser** — any modern one works. Chrome and Edge share the same DevTools, which these lessons use.
- **A project folder** — create one called `primer-js` anywhere you like. Everything you build in this topic lives there.

## Your first project files

Inside `primer-js`, create two files:

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <body>
    <h1>My JavaScript playground</h1>
    <script src="app.js"></script>
  </body>
</html>
```

```js
// app.js
console.log("The page loaded my script!");
```

Open `index.html` with Live Server (right-click the file → *Open with Live Server*). The page appears, and in the console you'll see your message. The `<script src="app.js">` tag is the bridge: the browser loads the page, reaches that tag, and runs your file.

## A habit worth building now

Keep DevTools open while you work — *always*. Errors, logs, and warnings appear there the moment something happens. Developers who keep the console closed are debugging blind.

<div class="callout"><b>Tip:</b> dock DevTools to the right side of the window so you can see your page and your console at the same time.</div>

## What to remember

1. Projects are folders of files; the `<script>` tag connects HTML to JavaScript.
2. Live Server gives you the same tight feedback loop the console does.
3. DevTools stays open. Every lesson from here assumes it is.
