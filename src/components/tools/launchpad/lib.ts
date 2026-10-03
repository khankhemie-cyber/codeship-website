/**
 * Pure helpers for the CODEship Launchpad: the preview document, the console
 * bridge, and the `#code=` link format. Kept free of React so the link format
 * stays easy to audit: changing it would break every link students have saved.
 */

import { deflateRaw, fromBase64Url, inflateRaw, toBase64Url } from "../shared/linkCodec";

export type Lang = "html" | "css" | "js";
export type Files = Record<Lang, string>;
export type LogLevel = "log" | "info" | "warn" | "error";
export type LogLine = { level: LogLevel; text: string; line?: number };

// Keys keep the tool's original name so work saved on a device before the
// rename (it was the "Web Playground") still loads.
export const STORAGE_KEY = "codeship-web-playground";
export const SETTINGS_KEY = "codeship-web-playground-settings";
export const HASH_KEY = "code=";
export const LONG_LINK = 8000;

// Captures console output and runtime errors inside the preview and posts
// them to the parent page. Kept ES5 so it runs whatever students write.
// JS_START/JS_LINES are filled in so error line numbers match the JS tab.
const CONSOLE_SHIM = `(function(){
function fmt(v){try{if(typeof v==="string")return v;if(v instanceof Error)return v.name+": "+v.message;if(typeof v==="function")return String(v);if(typeof Element!=="undefined"&&v instanceof Element)return v.outerHTML.slice(0,300);var s=JSON.stringify(v,null,2);return s===undefined?String(v):s;}catch(e){return String(v);}}
function send(level,args,line){try{parent.postMessage({__codeship:1,level:level,text:Array.prototype.map.call(args,fmt).join(" "),line:line},"*");}catch(e){}}
["log","info","warn","error","debug","table"].forEach(function(l){var o=console[l];var lv=l==="debug"||l==="table"?"log":l;console[l]=function(){send(lv,arguments);if(o)o.apply(console,arguments);};});
var oc=console.clear;console.clear=function(){try{parent.postMessage({__codeship:1,level:"clear",text:""},"*");}catch(e){}if(oc)oc.call(console);};
window.addEventListener("error",function(e){var n=e.lineno-JS_START+1;var ok=n>0&&n<=JS_LINES;send("error",[(e.message||"Error")+(ok?" (JavaScript line "+n+")":"")],ok?n:undefined);});
window.addEventListener("unhandledrejection",function(e){send("error",["Unhandled promise rejection: "+fmt(e.reason)]);});
})();`;

export function buildDocument(files: Files, withShim: boolean): string {
  // A literal "</script>" or "</style>" in student code would end our wrapper tag early.
  const css = files.css.replace(/<\/style/gi, "<\\/style");
  const js = files.js.replace(/<\/script/gi, "<\\/script");
  const head = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${withShim ? "<script>@@SHIM@@</script>\n" : ""}<style>
${css}
</style>
</head>
<body>
${files.html}
<script>
`;
  const jsStart = head.split("\n").length;
  // Shim joined onto one line so it doesn't shift the line count above.
  const shim = CONSOLE_SHIM.replace(/\n/g, "")
    .replace(/JS_START/g, String(jsStart))
    .replace(/JS_LINES/g, String(js.split("\n").length));
  return `${head.replace("@@SHIM@@", () => shim)}${js}
</script>
</body>
</html>`;
}

/**
 * A standalone page for "open in new tab". The new tab shares this site's
 * origin (it is a blob: URL), so student code still runs inside a sandboxed
 * iframe there and never at the site's origin.
 */
export function buildPopoutPage(files: Files, title: string): string {
  const doc = buildDocument(files, false)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
  const safeTitle = title.replace(/[<&]/g, "");
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle}</title>
<style>html,body{margin:0;height:100%;background:#fff}iframe{border:0;width:100%;height:100%;display:block}</style>
</head><body><iframe sandbox="allow-scripts allow-modals allow-forms allow-pointer-lock" srcdoc="${doc}"></iframe></body></html>`;
}

// Link format: "1" + base64url(deflate-raw(json)), or "0" + base64url(json)
// on browsers without CompressionStream.
export async function encodeFiles(files: Files): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify({ h: files.html, c: files.css, j: files.js }));
  try {
    return "1" + toBase64Url(await deflateRaw(bytes));
  } catch {
    return "0" + toBase64Url(bytes);
  }
}

export async function decodeFiles(code: string): Promise<Files> {
  let bytes = fromBase64Url(code.slice(1));
  if (code[0] === "1") bytes = await inflateRaw(bytes);
  else if (code[0] !== "0") throw new Error("Unknown link format");
  const data = JSON.parse(new TextDecoder().decode(bytes));
  return { html: String(data.h ?? ""), css: String(data.c ?? ""), js: String(data.j ?? "") };
}

export function readHash(): string | null {
  const hash = window.location.hash.slice(1);
  return hash.startsWith(HASH_KEY) ? hash.slice(HASH_KEY.length) : null;
}

export function readJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or storage blocked: the link still holds the work.
  }
}

export function loadLocalFiles(): Files | null {
  const data = readJSON<Partial<Files>>(STORAGE_KEY);
  if (!data) return null;
  return { html: String(data.html ?? ""), css: String(data.css ?? ""), js: String(data.js ?? "") };
}

export function downloadFile(name: string, content: string, type = "text/html") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
