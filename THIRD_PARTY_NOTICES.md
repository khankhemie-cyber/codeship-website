# Third-party notices

The CODEship Academy website and the Port CODEship game are proprietary (see
`LICENSE`). They use the following open-source software, each under its own
licence. The full licence text of each package ships with it in
`node_modules/<package>/` (Pyodide's in `public/py/pyodide-<version>/`).

| Software | Used for | Licence |
|---|---|---|
| [Three.js](https://github.com/mrdoob/three.js) | 3D graphics in Port CODEship | MIT |
| [Blockly](https://github.com/google/blockly) | Drag-and-drop coding blocks | Apache License 2.0 |
| [Pyodide](https://github.com/pyodide/pyodide) | Running Python in the browser | Mozilla Public License 2.0 (unmodified) |
| [CodeMirror](https://github.com/codemirror/dev) | Code editors in the coding tools | MIT |
| [Next.js](https://github.com/vercel/next.js) | Website framework | MIT |
| [React](https://github.com/facebook/react) | User interface | MIT |
| [Framer Motion](https://github.com/framer/motion) | Animations | MIT |
| [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (Microsoft) | Artwork in `public/art/` (3D style, resized to 256 px WebP, file name = Unicode code points): game pictures, the HTML Blocks picture bank and word-bank pictures | MIT (see below) |
| [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator), [webpack-obfuscator](https://github.com/javascript-obfuscator/webpack-obfuscator) | Build tools only (not shipped to visitors) | BSD 2-Clause |

Port CODEship's own 3D world, characters, challenges, text and art are made
from scratch by CODEship Academy. It contains no art, audio, models, code or
characters from other games.

## Fluent Emoji licence

The pictures in `public/art/` are from Microsoft's Fluent Emoji
(https://github.com/microsoft/fluentui-emoji, `assets/<name>/3D/`), unchanged
except for resizing and converting to WebP.

```
MIT License

Copyright (c) Microsoft Corporation.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE
```
