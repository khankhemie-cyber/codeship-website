import type { Files } from "./lib";

export type TemplateId = "welcome" | "blank" | "rocket" | "colors" | "guess" | "todo" | "animation";

export type Template = { id: TemplateId; files: Files };

const welcome: Files = {
  html: `<h1>Hello, World! 👋</h1>
<p class="intro">
  Welcome to the CODEship Web Playground!<br>
  Edit the HTML, CSS and JavaScript to see live results.
</p>

<div class="card">
  <h2>My First Card</h2>
  <p>This is a styled card. Check the CSS tab!</p>
  <button id="clickMe">Click Me!</button>
  <p id="clickCount">Clicks: 0</p>
</div>
`,
  css: `body {
  font-family: system-ui, sans-serif;
  margin: 0;
  min-height: 100vh;
  padding: 40px 20px;
  box-sizing: border-box;
  text-align: center;
  color: white;
  background: linear-gradient(135deg, #0A2342, #1E4D8C);
}

h1 {
  font-size: 48px;
  margin: 0 0 16px;
}

.intro {
  font-size: 18px;
  line-height: 1.6;
}

.card {
  max-width: 420px;
  margin: 32px auto 0;
  padding: 24px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
}

.card h2 {
  color: #F4D734;
  margin-top: 0;
}

button {
  background: #F4D734;
  color: #0A2342;
  border: none;
  border-radius: 8px;
  padding: 12px 28px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.1s;
}

#clickCount {
  color: #F4D734;
  font-size: 22px;
  font-weight: bold;
}
`,
  js: `// JavaScript runs here!
let clicks = 0;

const button = document.getElementById("clickMe");
const countDisplay = document.getElementById("clickCount");

button.addEventListener("click", function () {
  clicks++;
  countDisplay.textContent = "Clicks: " + clicks;

  // Add a fun animation
  button.style.transform = "scale(0.95)";
  setTimeout(() => {
    button.style.transform = "scale(1)";
  }, 100);

  console.log("Button clicked", clicks, "times");
});
`,
};

const blank: Files = {
  html: `<h1>My Page</h1>
`,
  css: `body {
  font-family: system-ui, sans-serif;
}
`,
  js: `// Write your JavaScript here
`,
};

const rocket: Files = {
  html: `<h1>Hello, CODEship!</h1>
<p>Edit the code on the left and watch this page change.</p>
<button id="launch">Launch the rocket</button>
<p id="message"></p>
`,
  css: `body {
  font-family: system-ui, sans-serif;
  background: #0A2342;
  color: white;
  text-align: center;
  padding: 40px;
}

button {
  background: #F4D734;
  border: none;
  padding: 12px 24px;
  font-size: 18px;
  cursor: pointer;
}
`,
  js: `const button = document.getElementById("launch");
const message = document.getElementById("message");

button.addEventListener("click", () => {
  message.textContent = "3... 2... 1... Liftoff!";
  console.log("The button was clicked");
});
`,
};

const colors: Files = {
  html: `<h1>Color Changer</h1>
<div id="box">Click a color!</div>
<div class="buttons">
  <button data-color="tomato">Red</button>
  <button data-color="gold">Yellow</button>
  <button data-color="mediumseagreen">Green</button>
  <button data-color="royalblue">Blue</button>
  <button id="random">Surprise me</button>
</div>
`,
  css: `body {
  font-family: system-ui, sans-serif;
  text-align: center;
  padding: 30px;
  background: #f4f6fb;
}

#box {
  width: 220px;
  height: 220px;
  margin: 20px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ddd;
  border-radius: 20px;
  font-size: 20px;
  font-weight: bold;
  transition: background 0.3s;
}

button {
  margin: 4px;
  padding: 10px 16px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #0A2342;
  color: white;
}
`,
  js: `const box = document.getElementById("box");

document.querySelectorAll("[data-color]").forEach((button) => {
  button.addEventListener("click", () => {
    box.style.background = button.dataset.color;
    box.textContent = button.dataset.color;
  });
});

document.getElementById("random").addEventListener("click", () => {
  // Pick a random red, green and blue amount from 0 to 255
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const color = "rgb(" + r + ", " + g + ", " + b + ")";
  box.style.background = color;
  box.textContent = color;
  console.log("New color:", color);
});
`,
};

const guess: Files = {
  html: `<h1>Guess the Number</h1>
<p>I'm thinking of a number from 1 to 100.</p>
<input id="guess" type="number" min="1" max="100" placeholder="Your guess">
<button id="check">Check</button>
<p id="hint"></p>
<p id="tries"></p>
`,
  css: `body {
  font-family: system-ui, sans-serif;
  text-align: center;
  padding: 40px;
  background: #0A2342;
  color: white;
}

input {
  font-size: 20px;
  padding: 8px;
  width: 140px;
  text-align: center;
}

button {
  font-size: 20px;
  padding: 8px 18px;
  background: #F4D734;
  border: none;
  cursor: pointer;
}

#hint {
  font-size: 24px;
  font-weight: bold;
  color: #F4D734;
}
`,
  js: `const secret = Math.floor(Math.random() * 100) + 1;
let tries = 0;

const input = document.getElementById("guess");
const hint = document.getElementById("hint");
const triesText = document.getElementById("tries");

function check() {
  const number = Number(input.value);
  if (!number) {
    hint.textContent = "Type a number first!";
    return;
  }
  tries++;
  triesText.textContent = "Tries: " + tries;

  if (number === secret) {
    hint.textContent = "You got it! 🎉";
  } else if (number < secret) {
    hint.textContent = "Higher ⬆️";
  } else {
    hint.textContent = "Lower ⬇️";
  }
  input.value = "";
  input.focus();
}

document.getElementById("check").addEventListener("click", check);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") check();
});
`,
};

const todo: Files = {
  html: `<h1>My To-Do List</h1>
<form id="form">
  <input id="task" placeholder="Add a task..." autocomplete="off">
  <button>Add</button>
</form>
<ul id="list"></ul>
`,
  css: `body {
  font-family: system-ui, sans-serif;
  max-width: 420px;
  margin: 40px auto;
  padding: 0 16px;
}

form {
  display: flex;
  gap: 8px;
}

input {
  flex: 1;
  font-size: 16px;
  padding: 8px;
}

button {
  font-size: 16px;
  padding: 8px 16px;
  background: #0A2342;
  color: white;
  border: none;
  cursor: pointer;
}

li {
  padding: 10px;
  margin: 6px 0;
  background: #f1f3f8;
  list-style: none;
  cursor: pointer;
}

li.done {
  text-decoration: line-through;
  color: #999;
}
`,
  js: `const form = document.getElementById("form");
const input = document.getElementById("task");
const list = document.getElementById("list");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading
  const text = input.value.trim();
  if (text === "") return;

  const item = document.createElement("li");
  item.textContent = text;
  // Click a task to mark it done
  item.addEventListener("click", () => item.classList.toggle("done"));
  list.appendChild(item);

  input.value = "";
  console.log("Added:", text);
});
`,
};

const animation: Files = {
  html: `<div class="sky">
  <div class="rocket">🚀</div>
</div>
<h1>CSS Animation</h1>
<p>Change the numbers in the CSS tab to change the animation.</p>
`,
  css: `body {
  font-family: system-ui, sans-serif;
  text-align: center;
  margin: 0;
  background: #0A2342;
  color: white;
}

.sky {
  height: 220px;
  position: relative;
  overflow: hidden;
}

.rocket {
  font-size: 64px;
  position: absolute;
  left: 50%;
  bottom: 0;
  animation: fly 3s ease-in-out infinite alternate;
}

@keyframes fly {
  from {
    transform: translate(-50%, 0) rotate(-45deg);
  }
  to {
    transform: translate(-50%, -130px) rotate(-45deg);
  }
}
`,
  js: `// Try making the rocket spin when you click it!
const rocket = document.querySelector(".rocket");

rocket.addEventListener("click", () => {
  console.log("Whoosh!");
});
`,
};

export const DEFAULT_TEMPLATE: Files = welcome;

export const TEMPLATES: Template[] = [
  { id: "welcome", files: welcome },
  { id: "blank", files: blank },
  { id: "rocket", files: rocket },
  { id: "colors", files: colors },
  { id: "guess", files: guess },
  { id: "todo", files: todo },
  { id: "animation", files: animation },
];
