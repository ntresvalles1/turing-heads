const v = Symbol("error"), _ = Symbol("message");
class b extends Event {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param type The name of the event
   * @param options A dictionary object that allows for setting
   *                  attributes via object members of the same name.
   */
  constructor(e, t = {}) {
    super(e), this[v] = t.error === void 0 ? null : t.error, this[_] = t.message === void 0 ? "" : t.message;
  }
  get error() {
    return this[v];
  }
  get message() {
    return this[_];
  }
}
Object.defineProperty(b.prototype, "error", { enumerable: !0 });
Object.defineProperty(b.prototype, "message", { enumerable: !0 });
const A = typeof globalThis.ErrorEvent == "function" ? globalThis.ErrorEvent : b;
function I(s) {
  return s instanceof Error ? "exitCode" in s && s?.exitCode === 0 || s?.name === "ExitStatus" && "status" in s && s.status === 0 : !1;
}
class N extends EventTarget {
  constructor() {
    super(...arguments), this.listenersCount = 0;
  }
  addEventListener(e, t) {
    ++this.listenersCount, super.addEventListener(e, t);
  }
  removeEventListener(e, t) {
    --this.listenersCount, super.removeEventListener(e, t);
  }
  hasListeners() {
    return this.listenersCount > 0;
  }
}
function $(s) {
  s.asm = {
    ...s.asm
  };
  const e = new N();
  for (const t in s.asm)
    if (typeof s.asm[t] == "function") {
      const r = s.asm[t];
      s.asm[t] = function(...n) {
        try {
          return r(...n);
        } catch (o) {
          if (!(o instanceof Error))
            throw o;
          const i = M(
            o,
            s.lastAsyncifyStackSource?.stack
          );
          if (s.lastAsyncifyStackSource && (o.cause = s.lastAsyncifyStackSource), e.hasListeners()) {
            e.dispatchEvent(
              new A("error", {
                error: o,
                message: i
              })
            );
            return;
          }
          throw I(o) || q(i), o;
        }
      };
    }
  return e;
}
let w = [];
function L() {
  return w;
}
function M(s, e) {
  if (s.message === "unreachable") {
    let t = B;
    e || (t += `

This stack trace is lacking. For a better one initialize 
the PHP runtime with { debug: true }, e.g. PHPNode.load('8.1', { debug: true }).

`), w = W(
      e || s.stack || ""
    );
    for (const r of w)
      t += `    * ${r}
`;
    return t;
  }
  return s.message;
}
const B = `
"unreachable" WASM instruction executed.

The typical reason is a PHP function missing from the ASYNCIFY_ONLY
list when building PHP.wasm.

You will need to file a new issue in the WordPress Playground repository
and paste this error message there:

https://github.com/WordPress/wordpress-playground/issues/new

If you're a core developer, the typical fix is to:

* Isolate a minimal reproduction of the error
* Add a reproduction of the error to php-asyncify.spec.ts in the WordPress Playground repository
* Run 'npm run fix-asyncify'
* Commit the changes, push to the repo, release updated NPM packages

Below is a list of all the PHP functions found in the stack trace to
help with the minimal reproduction. If they're all already listed in
the Dockerfile, you'll need to trigger this error again with long stack
traces enabled. In node.js, you can do it using the --stack-trace-limit=100
CLI option: 

`, E = "\x1B[41m", D = "\x1B[1m", R = "\x1B[0m", S = "\x1B[K";
let x = !1;
function q(s) {
  if (!x) {
    x = !0, console.log(`${E}
${S}
${D}  WASM ERROR${R}${E}`);
    for (const e of s.split(`
`))
      console.log(`${S}  ${e} `);
    console.log(`${R}`);
  }
}
function W(s) {
  try {
    const e = s.split(`
`).slice(1).map((t) => {
      const r = t.trim().substring(3).split(" ");
      return {
        fn: r.length >= 2 ? r[0] : "<unknown>",
        isWasm: t.includes("wasm://")
      };
    }).filter(
      ({ fn: t, isWasm: r }) => r && !t.startsWith("dynCall_") && !t.startsWith("invoke_")
    ).map(({ fn: t }) => t);
    return Array.from(new Set(e));
  } catch {
    return [];
  }
}
class g {
  constructor(e, t, r, n = "", o = 0) {
    this.httpStatusCode = e, this.headers = t, this.bytes = r, this.exitCode = o, this.errors = n;
  }
  static fromRawData(e) {
    return new g(
      e.httpStatusCode,
      e.headers,
      e.bytes,
      e.errors,
      e.exitCode
    );
  }
  toRawData() {
    return {
      headers: this.headers,
      bytes: this.bytes,
      errors: this.errors,
      exitCode: this.exitCode,
      httpStatusCode: this.httpStatusCode
    };
  }
  /**
   * Response body as JSON.
   */
  get json() {
    return JSON.parse(this.text);
  }
  /**
   * Response body as text.
   */
  get text() {
    return new TextDecoder().decode(this.bytes);
  }
}
const H = [
  "8.2",
  "8.1",
  "8.0",
  "7.4",
  "7.3",
  "7.2",
  "7.1",
  "7.0",
  "5.6"
], re = H[0], se = H;
class j {
  #e;
  #t;
  /**
   * @param  server - The PHP server to browse.
   * @param  config - The browser configuration.
   */
  constructor(e, t = {}) {
    this.requestHandler = e, this.#e = {}, this.#t = {
      handleRedirects: !1,
      maxRedirects: 4,
      ...t
    };
  }
  /**
   * Sends the request to the server.
   *
   * When cookies are present in the response, this method stores
   * them and sends them with any subsequent requests.
   *
   * When a redirection is present in the response, this method
   * follows it by discarding a response and sending a subsequent
   * request.
   *
   * @param  request   - The request.
   * @param  redirects - Internal. The number of redirects handled so far.
   * @returns PHPRequestHandler response.
   */
  async request(e, t = 0) {
    const r = await this.requestHandler.request({
      ...e,
      headers: {
        ...e.headers,
        cookie: this.#r()
      }
    });
    if (r.headers["set-cookie"] && this.#s(r.headers["set-cookie"]), this.#t.handleRedirects && r.headers.location && t < this.#t.maxRedirects) {
      const n = new URL(
        r.headers.location[0],
        this.requestHandler.absoluteUrl
      );
      return this.request(
        {
          url: n.toString(),
          method: "GET",
          headers: {}
        },
        t + 1
      );
    }
    return r;
  }
  /** @inheritDoc */
  pathToInternalUrl(e) {
    return this.requestHandler.pathToInternalUrl(e);
  }
  /** @inheritDoc */
  internalUrlToPath(e) {
    return this.requestHandler.internalUrlToPath(e);
  }
  /** @inheritDoc */
  get absoluteUrl() {
    return this.requestHandler.absoluteUrl;
  }
  /** @inheritDoc */
  get documentRoot() {
    return this.requestHandler.documentRoot;
  }
  #s(e) {
    for (const t of e)
      try {
        if (!t.includes("="))
          continue;
        const r = t.indexOf("="), n = t.substring(0, r), o = t.substring(r + 1).split(";")[0];
        this.#e[n] = o;
      } catch (r) {
        console.error(r);
      }
  }
  #r() {
    const e = [];
    for (const t in this.#e)
      e.push(`${t}=${this.#e[t]}`);
    return e.join("; ");
  }
}
class z {
  constructor({ concurrency: e }) {
    this._running = 0, this.concurrency = e, this.queue = [];
  }
  get running() {
    return this._running;
  }
  async acquire() {
    for (; ; )
      if (this._running >= this.concurrency)
        await new Promise((e) => this.queue.push(e));
      else {
        this._running++;
        let e = !1;
        return () => {
          e || (e = !0, this._running--, this.queue.length > 0 && this.queue.shift()());
        };
      }
  }
  async run(e) {
    const t = await this.acquire();
    try {
      return await e();
    } finally {
      t();
    }
  }
}
const G = "http://example.com";
function T(s) {
  return s.toString().substring(s.origin.length);
}
function k(s, e) {
  return !e || !s.startsWith(e) ? s : s.substring(e.length);
}
function V(s, e) {
  return !e || s.startsWith(e) ? s : e + s;
}
class Y {
  #e;
  #t;
  #s;
  #r;
  #o;
  #n;
  #i;
  #a;
  #l;
  /**
   * @param  php    - The PHP instance.
   * @param  config - Request Handler configuration.
   */
  constructor(e, t = {}) {
    this.#a = new z({ concurrency: 1 });
    const {
      documentRoot: r = "/www/",
      absoluteUrl: n = typeof location == "object" ? location?.href : "",
      isStaticFilePath: o = () => !1
    } = t;
    this.php = e, this.#e = r, this.#l = o;
    const i = new URL(n);
    this.#s = i.hostname, this.#r = i.port ? Number(i.port) : i.protocol === "https:" ? 443 : 80, this.#t = (i.protocol || "").replace(":", "");
    const l = this.#r !== 443 && this.#r !== 80;
    this.#o = [
      this.#s,
      l ? `:${this.#r}` : ""
    ].join(""), this.#n = i.pathname.replace(/\/+$/, ""), this.#i = [
      `${this.#t}://`,
      this.#o,
      this.#n
    ].join("");
  }
  /** @inheritDoc */
  pathToInternalUrl(e) {
    return `${this.absoluteUrl}${e}`;
  }
  /** @inheritDoc */
  internalUrlToPath(e) {
    const t = new URL(e);
    return t.pathname.startsWith(this.#n) && (t.pathname = t.pathname.slice(this.#n.length)), T(t);
  }
  get isRequestRunning() {
    return this.#a.running > 0;
  }
  /** @inheritDoc */
  get absoluteUrl() {
    return this.#i;
  }
  /** @inheritDoc */
  get documentRoot() {
    return this.#e;
  }
  /** @inheritDoc */
  async request(e) {
    const t = e.url.startsWith("http://") || e.url.startsWith("https://"), r = new URL(
      e.url,
      t ? void 0 : G
    ), n = k(
      r.pathname,
      this.#n
    );
    return this.#l(n) ? this.#c(n) : await this.#h(e, r);
  }
  /**
   * Serves a static file from the PHP filesystem.
   *
   * @param  path - The requested static file path.
   * @returns The response.
   */
  #c(e) {
    const t = `${this.#e}${e}`;
    if (!this.php.fileExists(t))
      return new g(
        404,
        {},
        new TextEncoder().encode("404 File not found")
      );
    const r = this.php.readFileAsBuffer(t);
    return new g(
      200,
      {
        "content-length": [`${r.byteLength}`],
        // @TODO: Infer the content-type from the arrayBuffer instead of the file path.
        //        The code below won't return the correct mime-type if the extension
        //        was tampered with.
        "content-type": [K(t)],
        "accept-ranges": ["bytes"],
        "cache-control": ["public, max-age=0"]
      },
      r
    );
  }
  /**
   * Runs the requested PHP file with all the request and $_SERVER
   * superglobals populated.
   *
   * @param  request - The request.
   * @returns The response.
   */
  async #h(e, t) {
    const r = await this.#a.acquire();
    try {
      this.php.addServerGlobalEntry("DOCUMENT_ROOT", this.#e), this.php.addServerGlobalEntry(
        "HTTPS",
        this.#i.startsWith("https://") ? "on" : ""
      );
      let n = "GET";
      const o = {
        host: this.#o,
        ...U(e.headers || {})
      }, i = [];
      if (e.files && Object.keys(e.files).length) {
        n = "POST";
        for (const c in e.files) {
          const m = e.files[c];
          i.push({
            key: c,
            name: m.name,
            type: m.type,
            data: new Uint8Array(await m.arrayBuffer())
          });
        }
        o["content-type"]?.startsWith("multipart/form-data") && (e.formData = J(
          e.body || ""
        ), o["content-type"] = "application/x-www-form-urlencoded", delete e.body);
      }
      let l;
      e.formData !== void 0 ? (n = "POST", o["content-type"] = o["content-type"] || "application/x-www-form-urlencoded", l = new URLSearchParams(
        e.formData
      ).toString()) : l = e.body;
      let h;
      try {
        h = this.#u(t.pathname);
      } catch {
        return new g(
          404,
          {},
          new TextEncoder().encode("404 File not found")
        );
      }
      return await this.php.run({
        relativeUri: V(
          T(t),
          this.#n
        ),
        protocol: this.#t,
        method: e.method || n,
        body: l,
        fileInfos: i,
        scriptPath: h,
        headers: o
      });
    } finally {
      r();
    }
  }
  /**
   * Resolve the requested path to the filesystem path of the requested PHP file.
   *
   * Fall back to index.php as if there was a url rewriting rule in place.
   *
   * @param  requestedPath - The requested pathname.
   * @throws {Error} If the requested path doesn't exist.
   * @returns The resolved filesystem path.
   */
  #u(e) {
    let t = k(e, this.#n);
    t.includes(".php") ? t = t.split(".php")[0] + ".php" : (t.endsWith("/") || (t += "/"), t.endsWith("index.php") || (t += "index.php"));
    const r = `${this.#e}${t}`;
    if (this.php.fileExists(r))
      return r;
    if (!this.php.fileExists(`${this.#e}/index.php`))
      throw new Error(`File not found: ${r}`);
    return `${this.#e}/index.php`;
  }
}
function J(s) {
  const e = {}, t = s.match(/--(.*)\r\n/);
  if (!t)
    return e;
  const r = t[1], n = s.split(`--${r}`);
  return n.shift(), n.pop(), n.forEach((o) => {
    const i = o.indexOf(`\r
\r
`), l = o.substring(0, i).trim(), h = o.substring(i + 4).trim(), c = l.match(/name="([^"]+)"/);
    if (c) {
      const m = c[1];
      e[m] = h;
    }
  }), e;
}
function K(s) {
  switch (s.split(".").pop()) {
    case "css":
      return "text/css";
    case "js":
      return "application/javascript";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "woff":
      return "font/woff";
    case "woff2":
      return "font/woff2";
    case "ttf":
      return "font/ttf";
    case "otf":
      return "font/otf";
    case "eot":
      return "font/eot";
    case "ico":
      return "image/x-icon";
    case "html":
      return "text/html";
    case "json":
      return "application/json";
    case "xml":
      return "application/xml";
    case "txt":
    case "md":
      return "text/plain";
    default:
      return "application-octet-stream";
  }
}
const C = {
  0: "No error occurred. System call completed successfully.",
  1: "Argument list too long.",
  2: "Permission denied.",
  3: "Address in use.",
  4: "Address not available.",
  5: "Address family not supported.",
  6: "Resource unavailable, or operation would block.",
  7: "Connection already in progress.",
  8: "Bad file descriptor.",
  9: "Bad message.",
  10: "Device or resource busy.",
  11: "Operation canceled.",
  12: "No child processes.",
  13: "Connection aborted.",
  14: "Connection refused.",
  15: "Connection reset.",
  16: "Resource deadlock would occur.",
  17: "Destination address required.",
  18: "Mathematics argument out of domain of function.",
  19: "Reserved.",
  20: "File exists.",
  21: "Bad address.",
  22: "File too large.",
  23: "Host is unreachable.",
  24: "Identifier removed.",
  25: "Illegal byte sequence.",
  26: "Operation in progress.",
  27: "Interrupted function.",
  28: "Invalid argument.",
  29: "I/O error.",
  30: "Socket is connected.",
  31: "There is a directory under that path.",
  32: "Too many levels of symbolic links.",
  33: "File descriptor value too large.",
  34: "Too many links.",
  35: "Message too large.",
  36: "Reserved.",
  37: "Filename too long.",
  38: "Network is down.",
  39: "Connection aborted by network.",
  40: "Network unreachable.",
  41: "Too many files open in system.",
  42: "No buffer space available.",
  43: "No such device.",
  44: "There is no such file or directory OR the parent directory does not exist.",
  45: "Executable file format error.",
  46: "No locks available.",
  47: "Reserved.",
  48: "Not enough space.",
  49: "No message of the desired type.",
  50: "Protocol not available.",
  51: "No space left on device.",
  52: "Function not supported.",
  53: "The socket is not connected.",
  54: "Not a directory or a symbolic link to a directory.",
  55: "Directory not empty.",
  56: "State not recoverable.",
  57: "Not a socket.",
  58: "Not supported, or operation not supported on socket.",
  59: "Inappropriate I/O control operation.",
  60: "No such device or address.",
  61: "Value too large to be stored in data type.",
  62: "Previous owner died.",
  63: "Operation not permitted.",
  64: "Broken pipe.",
  65: "Protocol error.",
  66: "Protocol not supported.",
  67: "Protocol wrong type for socket.",
  68: "Result too large.",
  69: "Read-only file system.",
  70: "Invalid seek.",
  71: "No such process.",
  72: "Reserved.",
  73: "Connection timed out.",
  74: "Text file busy.",
  75: "Cross-device link.",
  76: "Extension: Capabilities insufficient."
};
function p(s = "") {
  return function(t, r, n) {
    const o = n.value;
    n.value = function(...i) {
      try {
        return o.apply(this, i);
      } catch (l) {
        const h = typeof l == "object" ? l?.errno : null;
        if (h in C) {
          const c = C[h], m = typeof i[0] == "string" ? i[0] : null, O = m !== null ? s.replaceAll("{path}", m) : s;
          throw new Error(`${O}: ${c}`, {
            cause: l
          });
        }
        throw l;
      }
    };
  };
}
async function ne(s, e = {}, t = []) {
  const [r, n, o] = F(), [i, l] = F(), h = s.init(Q, {
    onAbort(c) {
      o(c), l(), console.error(c);
    },
    ENV: {},
    // Emscripten sometimes prepends a '/' to the path, which
    // breaks vite dev mode. An identity `locateFile` function
    // fixes it.
    locateFile: (c) => c,
    ...e,
    noInitialRun: !0,
    onRuntimeInitialized() {
      e.onRuntimeInitialized && e.onRuntimeInitialized(), n();
    },
    monitorRunDependencies(c) {
      c === 0 && (delete h.monitorRunDependencies, l());
    }
  });
  return await Promise.all(
    t.map(
      ({ default: c }) => c(h)
    )
  ), t.length || l(), await i, await r, P.push(h), P.length - 1;
}
const P = [];
function Z(s) {
  return P[s];
}
const Q = function() {
  return typeof process < "u" && process.release?.name === "node" ? "NODE" : typeof window < "u" ? "WEB" : typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope ? "WORKER" : "NODE";
}(), F = () => {
  const s = [], e = new Promise((t, r) => {
    s.push(t, r);
  });
  return s.unshift(e), s;
};
var X = Object.defineProperty, ee = Object.getOwnPropertyDescriptor, f = (s, e, t, r) => {
  for (var n = r > 1 ? void 0 : r ? ee(e, t) : e, o = s.length - 1, i; o >= 0; o--)
    (i = s[o]) && (n = (r ? i(e, t, n) : i(n)) || n);
  return r && n && X(e, t, n), n;
};
const u = "string", y = "number", a = Symbol("__private__dont__use");
class d {
  /**
   * Initializes a PHP runtime.
   *
   * @internal
   * @param  PHPRuntime - Optional. PHP Runtime ID as initialized by loadPHPRuntime.
   * @param  serverOptions - Optional. Options for the PHPRequestHandler. If undefined, no request handler will be initialized.
   */
  constructor(e, t) {
    this.#e = [], this.#t = !1, this.#s = null, this.#r = {}, this.#o = [], e !== void 0 && this.initializeRuntime(e), t && (this.requestHandler = new j(
      new Y(this, t)
    ));
  }
  #e;
  #t;
  #s;
  #r;
  #o;
  /** @inheritDoc */
  async onMessage(e) {
    this.#o.push(e);
  }
  /** @inheritDoc */
  get absoluteUrl() {
    return this.requestHandler.requestHandler.absoluteUrl;
  }
  /** @inheritDoc */
  get documentRoot() {
    return this.requestHandler.requestHandler.documentRoot;
  }
  /** @inheritDoc */
  pathToInternalUrl(e) {
    return this.requestHandler.requestHandler.pathToInternalUrl(e);
  }
  /** @inheritDoc */
  internalUrlToPath(e) {
    return this.requestHandler.requestHandler.internalUrlToPath(
      e
    );
  }
  initializeRuntime(e) {
    if (this[a])
      throw new Error("PHP runtime already initialized.");
    const t = Z(e);
    if (!t)
      throw new Error("Invalid PHP runtime id.");
    this[a] = t, t.onMessage = (r) => {
      for (const n of this.#o)
        n(r);
    }, this.#s = $(t);
  }
  /** @inheritDoc */
  setPhpIniPath(e) {
    if (this.#t)
      throw new Error("Cannot set PHP ini path after calling run().");
    this[a].ccall(
      "wasm_set_phpini_path",
      null,
      ["string"],
      [e]
    );
  }
  /** @inheritDoc */
  setPhpIniEntry(e, t) {
    if (this.#t)
      throw new Error("Cannot set PHP ini entries after calling run().");
    this.#e.push([e, t]);
  }
  /** @inheritDoc */
  chdir(e) {
    this[a].FS.chdir(e);
  }
  /** @inheritDoc */
  async request(e, t) {
    if (!this.requestHandler)
      throw new Error("No request handler available.");
    return this.requestHandler.request(e, t);
  }
  /** @inheritDoc */
  async run(e) {
    this.#t || (this.#n(), this.#t = !0), this.#d(e.scriptPath || ""), this.#a(e.relativeUri || ""), this.#c(e.method || "GET");
    const { host: t, ...r } = {
      host: "example.com:443",
      ...U(e.headers || {})
    };
    if (this.#l(t, e.protocol || "http"), this.#h(r), e.body && this.#u(e.body), e.fileInfos)
      for (const n of e.fileInfos)
        this.#f(n);
    return e.code && this.#m(" ?>" + e.code), this.#p(), await this.#y();
  }
  #n() {
    if (this.#e.length > 0) {
      const e = this.#e.map(([t, r]) => `${t}=${r}`).join(`
`) + `

`;
      this[a].ccall(
        "wasm_set_phpini_entries",
        null,
        [u],
        [e]
      );
    }
    this[a].ccall("php_wasm_init", null, [], []);
  }
  #i() {
    const e = "/tmp/headers.json";
    if (!this.fileExists(e))
      throw new Error(
        "SAPI Error: Could not find response headers file."
      );
    const t = JSON.parse(this.readFileAsText(e)), r = {};
    for (const n of t.headers) {
      if (!n.includes(": "))
        continue;
      const o = n.indexOf(": "), i = n.substring(0, o).toLowerCase(), l = n.substring(o + 2);
      i in r || (r[i] = []), r[i].push(l);
    }
    return {
      headers: r,
      httpStatusCode: t.status
    };
  }
  #a(e) {
    if (this[a].ccall(
      "wasm_set_request_uri",
      null,
      [u],
      [e]
    ), e.includes("?")) {
      const t = e.substring(e.indexOf("?") + 1);
      this[a].ccall(
        "wasm_set_query_string",
        null,
        [u],
        [t]
      );
    }
  }
  #l(e, t) {
    this[a].ccall(
      "wasm_set_request_host",
      null,
      [u],
      [e]
    );
    let r;
    try {
      r = parseInt(new URL(e).port, 10);
    } catch {
    }
    (!r || isNaN(r) || r === 80) && (r = t === "https" ? 443 : 80), this[a].ccall(
      "wasm_set_request_port",
      null,
      [y],
      [r]
    ), (t === "https" || !t && r === 443) && this.addServerGlobalEntry("HTTPS", "on");
  }
  #c(e) {
    this[a].ccall(
      "wasm_set_request_method",
      null,
      [u],
      [e]
    );
  }
  #h(e) {
    e.cookie && this[a].ccall(
      "wasm_set_cookies",
      null,
      [u],
      [e.cookie]
    ), e["content-type"] && this[a].ccall(
      "wasm_set_content_type",
      null,
      [u],
      [e["content-type"]]
    ), e["content-length"] && this[a].ccall(
      "wasm_set_content_length",
      null,
      [y],
      [parseInt(e["content-length"], 10)]
    );
    for (const t in e) {
      let r = "HTTP_";
      ["content-type", "content-length"].includes(t.toLowerCase()) && (r = ""), this.addServerGlobalEntry(
        `${r}${t.toUpperCase().replace(/-/g, "_")}`,
        e[t]
      );
    }
  }
  #u(e) {
    this[a].ccall(
      "wasm_set_request_body",
      null,
      [u],
      [e]
    ), this[a].ccall(
      "wasm_set_content_length",
      null,
      [y],
      [new TextEncoder().encode(e).length]
    );
  }
  #d(e) {
    this[a].ccall(
      "wasm_set_path_translated",
      null,
      [u],
      [e]
    );
  }
  addServerGlobalEntry(e, t) {
    this.#r[e] = t;
  }
  #p() {
    for (const e in this.#r)
      this[a].ccall(
        "wasm_add_SERVER_entry",
        null,
        [u, u],
        [e, this.#r[e]]
      );
  }
  /**
   * Adds file information to $_FILES superglobal in PHP.
   *
   * In particular:
   * * Creates the file data in the filesystem
   * * Registers the file details in PHP
   *
   * @param  fileInfo - File details
   */
  #f(e) {
    const { key: t, name: r, type: n, data: o } = e, i = `/tmp/${Math.random().toFixed(20)}`;
    this.writeFile(i, o);
    const l = 0;
    this[a].ccall(
      "wasm_add_uploaded_file",
      null,
      [u, u, u, u, y, y],
      [t, r, n, i, l, o.byteLength]
    );
  }
  #m(e) {
    this[a].ccall(
      "wasm_set_php_code",
      null,
      [u],
      [e]
    );
  }
  async #y() {
    let e, t;
    try {
      e = await new Promise((o, i) => {
        t = (h) => {
          const c = new Error("Rethrown");
          c.cause = h.error, c.betterMessage = h.message, i(c);
        }, this.#s?.addEventListener(
          "error",
          t
        );
        const l = this[a].ccall(
          "wasm_sapi_handle_request",
          y,
          [],
          []
        );
        return l instanceof Promise ? l.then(o, i) : o(l);
      });
    } catch (o) {
      for (const c in this)
        typeof this[c] == "function" && (this[c] = () => {
          throw new Error(
            "PHP runtime has crashed – see the earlier error for details."
          );
        });
      this.functionsMaybeMissingFromAsyncify = L();
      const i = o, l = "betterMessage" in i ? i.betterMessage : i.message, h = new Error(l);
      throw h.cause = i, h;
    } finally {
      this.#s?.removeEventListener("error", t), this.#r = {};
    }
    const { headers: r, httpStatusCode: n } = this.#i();
    return new g(
      n,
      r,
      this.readFileAsBuffer("/tmp/stdout"),
      this.readFileAsText("/tmp/stderr"),
      e
    );
  }
  mkdir(e) {
    this[a].FS.mkdirTree(e);
  }
  mkdirTree(e) {
    this.mkdir(e);
  }
  readFileAsText(e) {
    return new TextDecoder().decode(this.readFileAsBuffer(e));
  }
  readFileAsBuffer(e) {
    return this[a].FS.readFile(e);
  }
  writeFile(e, t) {
    this[a].FS.writeFile(e, t);
  }
  unlink(e) {
    this[a].FS.unlink(e);
  }
  mv(e, t) {
    this[a].FS.rename(e, t);
  }
  rmdir(e, t = { recursive: !0 }) {
    t?.recursive && this.listFiles(e).forEach((r) => {
      const n = `${e}/${r}`;
      this.isDir(n) ? this.rmdir(n, t) : this.unlink(n);
    }), this[a].FS.rmdir(e);
  }
  listFiles(e, t = { prependPath: !1 }) {
    if (!this.fileExists(e))
      return [];
    try {
      const r = this[a].FS.readdir(e).filter(
        (n) => n !== "." && n !== ".."
      );
      if (t.prependPath) {
        const n = e.replace(/\/$/, "");
        return r.map((o) => `${n}/${o}`);
      }
      return r;
    } catch (r) {
      return console.error(r, { path: e }), [];
    }
  }
  isDir(e) {
    return this.fileExists(e) ? this[a].FS.isDir(
      this[a].FS.lookupPath(e).node.mode
    ) : !1;
  }
  fileExists(e) {
    try {
      return this[a].FS.lookupPath(e), !0;
    } catch {
      return !1;
    }
  }
}
f([
  p('Could not create directory "{path}"')
], d.prototype, "mkdir", 1);
f([
  p('Could not create directory "{path}"')
], d.prototype, "mkdirTree", 1);
f([
  p('Could not read "{path}"')
], d.prototype, "readFileAsText", 1);
f([
  p('Could not read "{path}"')
], d.prototype, "readFileAsBuffer", 1);
f([
  p('Could not write to "{path}"')
], d.prototype, "writeFile", 1);
f([
  p('Could not unlink "{path}"')
], d.prototype, "unlink", 1);
f([
  p('Could not move "{path}"')
], d.prototype, "mv", 1);
f([
  p('Could not remove directory "{path}"')
], d.prototype, "rmdir", 1);
f([
  p('Could not list files in "{path}"')
], d.prototype, "listFiles", 1);
f([
  p('Could not stat "{path}"')
], d.prototype, "isDir", 1);
f([
  p('Could not stat "{path}"')
], d.prototype, "fileExists", 1);
function U(s) {
  const e = {};
  for (const t in s)
    e[t.toLowerCase()] = s[t];
  return e;
}
function te(s) {
  return !(s instanceof d);
}
function oe(s) {
  return !te(s);
}
export {
  d as BasePHP,
  G as DEFAULT_BASE_URL,
  re as LatestSupportedPHPVersion,
  j as PHPBrowser,
  Y as PHPRequestHandler,
  g as PHPResponse,
  H as SupportedPHPVersions,
  se as SupportedPHPVersionsList,
  N as UnhandledRejectionsTarget,
  a as __private__dont__use,
  V as ensurePathPrefix,
  I as isExitCodeZero,
  te as isLocalPHP,
  oe as isRemotePHP,
  ne as loadPHPRuntime,
  k as removePathPrefix,
  p as rethrowFileSystemError,
  T as toRelativeUrl
};
