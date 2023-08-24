// packages/php-wasm/util/src/lib/semaphore.ts
var Semaphore = class {
  _running = 0;
  concurrency;
  queue;
  constructor({ concurrency }) {
    this.concurrency = concurrency;
    this.queue = [];
  }
  get running() {
    return this._running;
  }
  async acquire() {
    while (true) {
      if (this._running >= this.concurrency) {
        await new Promise((resolve) => this.queue.push(resolve));
      } else {
        this._running++;
        let released = false;
        return () => {
          if (released) {
            return;
          }
          released = true;
          this._running--;
          if (this.queue.length > 0) {
            this.queue.shift()();
          }
        };
      }
    }
  }
  async run(fn) {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }
};

// packages/php-wasm/util/src/lib/join-paths.ts
function joinPaths(...paths) {
  let path = paths.join("/");
  const isAbsolute = path.charAt(0) === "/";
  const trailingSlash = path.substring(path.length - 1) === "/";
  path = normalizePathsArray(
    path.split("/").filter((p) => !!p),
    !isAbsolute
  ).join("/");
  if (!path && !isAbsolute) {
    path = ".";
  }
  if (path && trailingSlash) {
    path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
}
function normalizePathsArray(parts, allowAboveRoot) {
  let up = 0;
  for (let i = parts.length - 1; i >= 0; i--) {
    const last = parts[i];
    if (last === ".") {
      parts.splice(i, 1);
    } else if (last === "..") {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }
  if (allowAboveRoot) {
    for (; up; up--) {
      parts.unshift("..");
    }
  }
  return parts;
}

// packages/php-wasm/util/src/lib/php-vars.ts
var literal = Symbol("literal");
function phpVar(value) {
  if (typeof value === "string") {
    if (value.startsWith("$")) {
      return value;
    } else {
      return JSON.stringify(value);
    }
  } else if (typeof value === "number") {
    return value.toString();
  } else if (Array.isArray(value)) {
    const phpArray = value.map(phpVar).join(", ");
    return `array(${phpArray})`;
  } else if (value === null) {
    return "null";
  } else if (typeof value === "object") {
    if (literal in value) {
      return value.toString();
    } else {
      const phpAssocArray = Object.entries(value).map(([key, val]) => `${JSON.stringify(key)} => ${phpVar(val)}`).join(", ");
      return `array(${phpAssocArray})`;
    }
  } else if (typeof value === "function") {
    return value();
  }
  throw new Error(`Unsupported value: ${value}`);
}
function phpVars(vars) {
  const result = {};
  for (const key in vars) {
    result[key] = phpVar(vars[key]);
  }
  return result;
}
export {
  Semaphore,
  joinPaths,
  phpVar,
  phpVars
};
