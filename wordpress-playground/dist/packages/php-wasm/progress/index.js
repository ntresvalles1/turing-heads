class f extends EventTarget {
  #e = {};
  #t = {};
  constructor(e = []) {
    super(), this.setModules(e), this.#s();
  }
  getEmscriptenOptions() {
    return {
      dataFileDownloads: this.#r()
    };
  }
  setModules(e) {
    this.#e = e.reduce((t, s) => {
      if (s.dependenciesTotalSize > 0) {
        const i = "http://example.com/", n = new URL(s.dependencyFilename, i).pathname.split("/").pop();
        t[n] = Math.max(
          n in t ? t[n] : 0,
          s.dependenciesTotalSize
        );
      }
      return t;
    }, {}), this.#t = Object.fromEntries(
      Object.entries(this.#e).map(([t]) => [t, 0])
    );
  }
  /**
   * Replaces the default WebAssembly.instantiateStreaming with a version
   * that monitors the download #progress.
   */
  #s() {
    const e = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async (t, ...s) => {
      const i = await t, r = i.url.substring(
        new URL(i.url).origin.length + 1
      ), n = c(
        i,
        ({ detail: { loaded: a, total: l } }) => this.#i(r, a, l)
      );
      return e(n, ...s);
    };
  }
  /**
   * Creates a `dataFileDownloads` Proxy object that can be passed
   * to `startPHP` to monitor the download #progress of the data
   * dependencies.
   */
  #r() {
    const e = this, t = {};
    return new Proxy(t, {
      set(s, i, r) {
        return e.#i(i, r.loaded, r.total), s[i] = new Proxy(JSON.parse(JSON.stringify(r)), {
          set(n, a, l) {
            return n[a] = l, e.#i(i, n.loaded, n.total), !0;
          }
        }), !0;
      }
    });
  }
  /**
   * Notifies about the download #progress of a file.
   *
   * @param  file   The file name.
   * @param  loaded The number of bytes of that file loaded so far.
   * @param  fileSize  The total number of bytes in the loaded file.
   */
  #i(e, t, s) {
    const i = new URL(e, "http://example.com").pathname.split("/").pop();
    s || (s = this.#e[i]), i in this.#t || console.warn(
      `Registered a download #progress of an unregistered file "${i}". This may cause a sudden **decrease** in the #progress percentage as the total number of bytes increases during the download.`
    ), this.#t[i] = t, this.dispatchEvent(
      new CustomEvent("progress", {
        detail: {
          loaded: g(this.#t),
          total: g(this.#e)
        }
      })
    );
  }
}
function g(o) {
  return Object.values(o).reduce((e, t) => e + t, 0);
}
function c(o, e) {
  const t = o.headers.get("content-length") || "", s = parseInt(t, 10) || 5242880;
  function i(r, n) {
    e(
      new CustomEvent("progress", {
        detail: {
          loaded: r,
          total: n
        }
      })
    );
  }
  return new Response(
    new ReadableStream({
      async start(r) {
        if (!o.body) {
          r.close();
          return;
        }
        const n = o.body.getReader();
        let a = 0;
        for (; ; )
          try {
            const { done: l, value: h } = await n.read();
            if (h && (a += h.byteLength), l) {
              i(a, a), r.close();
              break;
            } else
              i(a, s), r.enqueue(h);
          } catch (l) {
            console.error({ e: l }), r.error(l);
            break;
          }
      }
    }),
    {
      status: o.status,
      statusText: o.statusText,
      headers: o.headers
    }
  );
}
class p extends EventTarget {
  constructor() {
    super(...arguments), this.#e = {}, this.#t = 0, this.progress = 0, this.mode = "REAL_TIME", this.caption = "";
  }
  #e;
  #t;
  partialObserver(e, t = "") {
    const s = ++this.#t;
    return this.#e[s] = 0, (i) => {
      const { loaded: r, total: n } = i?.detail || {};
      this.#e[s] = r / n * e, this.#s(this.totalProgress, "REAL_TIME", t);
    };
  }
  slowlyIncrementBy(e) {
    const t = ++this.#t;
    this.#e[t] = e, this.#s(this.totalProgress, "SLOWLY_INCREMENT");
  }
  get totalProgress() {
    return Object.values(this.#e).reduce(
      (e, t) => e + t,
      0
    );
  }
  #s(e, t, s) {
    this.dispatchEvent(
      new CustomEvent("progress", {
        detail: {
          progress: e,
          mode: t,
          caption: s
        }
      })
    );
  }
}
const d = 1e-5;
class u extends EventTarget {
  constructor({
    weight: e = 1,
    caption: t = "",
    fillTime: s = 4
  } = {}) {
    super(), this._selfWeight = 1, this._selfDone = !1, this._selfProgress = 0, this._selfCaption = "", this._isFilling = !1, this._subTrackers = [], this._weight = e, this._selfCaption = t, this._fillTime = s;
  }
  /**
   * Creates a new sub-tracker with a specific weight.
   *
   * The weight determines what percentage of the overall progress
   * the sub-tracker represents. For example, if the main tracker is
   * monitoring a process that has two stages, and the first stage
   * is expected to take twice as long as the second stage, you could
   * create the first sub-tracker with a weight of 0.67 and the second
   * sub-tracker with a weight of 0.33.
   *
   * The caption is an optional string that describes the current stage
   * of the operation. If provided, it will be used as the progress caption
   * for the sub-tracker. If not provided, the main tracker will look for
   * the next sub-tracker with a non-empty caption and use that as the progress
   * caption instead.
   *
   * Returns the newly-created sub-tracker.
   *
   * @throws {Error} If the weight of the new stage would cause the total weight of all stages to exceed 1.
   *
   * @param weight The weight of the new stage, as a decimal value between 0 and 1.
   * @param caption The caption for the new stage, which will be used as the progress caption for the sub-tracker.
   *
   * @example
   * ```ts
   * const tracker = new ProgressTracker();
   * const subTracker1 = tracker.stage(0.67, 'Slow stage');
   * const subTracker2 = tracker.stage(0.33, 'Fast stage');
   *
   * subTracker2.set(50);
   * subTracker1.set(75);
   * subTracker2.set(100);
   * subTracker1.set(100);
   * ```
   */
  stage(e, t = "") {
    if (e || (e = this._selfWeight), this._selfWeight - e < -d)
      throw new Error(
        `Cannot add a stage with weight ${e} as the total weight of registered stages would exceed 1.`
      );
    this._selfWeight -= e;
    const s = new u({
      caption: t,
      weight: e,
      fillTime: this._fillTime
    });
    return this._subTrackers.push(s), s.addEventListener("progress", () => this.notifyProgress()), s.addEventListener("done", () => {
      this.done && this.notifyDone();
    }), s;
  }
  /**
   * Fills the progress bar slowly over time, simulating progress.
   *
   * The progress bar is filled in a 100 steps, and each step, the progress
   * is increased by 1. If `stopBeforeFinishing` is true, the progress bar
   * will stop filling when it reaches 99% so that you can call `finish()`
   * explicitly.
   *
   * If the progress bar is filling or already filled, this method does nothing.
   *
   * @example
   * ```ts
   * const progress = new ProgressTracker({ caption: 'Processing...' });
   * progress.fillSlowly();
   * ```
   *
   * @param options Optional options.
   */
  fillSlowly({ stopBeforeFinishing: e = !0 } = {}) {
    if (this._isFilling)
      return;
    this._isFilling = !0;
    const t = 100, s = this._fillTime / t;
    this._fillInterval = setInterval(() => {
      this.set(this._selfProgress + 1), e && this._selfProgress >= 99 && clearInterval(this._fillInterval);
    }, s);
  }
  set(e) {
    this._selfProgress = Math.min(e, 100), this.notifyProgress(), this._selfProgress + d >= 100 && this.finish();
  }
  finish() {
    this._fillInterval && clearInterval(this._fillInterval), this._selfDone = !0, this._selfProgress = 100, this._isFilling = !1, this._fillInterval = void 0, this.notifyProgress(), this.notifyDone();
  }
  get caption() {
    for (let e = this._subTrackers.length - 1; e >= 0; e--)
      if (!this._subTrackers[e].done) {
        const t = this._subTrackers[e].caption;
        if (t)
          return t;
      }
    return this._selfCaption;
  }
  setCaption(e) {
    this._selfCaption = e, this.notifyProgress();
  }
  get done() {
    return this.progress + d >= 100;
  }
  get progress() {
    if (this._selfDone)
      return 100;
    const e = this._subTrackers.reduce(
      (t, s) => t + s.progress * s.weight,
      this._selfProgress * this._selfWeight
    );
    return Math.round(e * 1e4) / 1e4;
  }
  get weight() {
    return this._weight;
  }
  get observer() {
    return this._progressObserver || (this._progressObserver = (e) => {
      this.set(e);
    }), this._progressObserver;
  }
  get loadingListener() {
    return this._loadingListener || (this._loadingListener = (e) => {
      this.set(e.detail.loaded / e.detail.total * 100);
    }), this._loadingListener;
  }
  pipe(e) {
    e.setProgress({
      progress: this.progress,
      caption: this.caption
    }), this.addEventListener("progress", (t) => {
      e.setProgress({
        progress: t.detail.progress,
        caption: t.detail.caption
      });
    }), this.addEventListener("done", () => {
      e.setLoaded();
    });
  }
  addEventListener(e, t) {
    super.addEventListener(e, t);
  }
  removeEventListener(e, t) {
    super.removeEventListener(e, t);
  }
  notifyProgress() {
    const e = this;
    this.dispatchEvent(
      new CustomEvent("progress", {
        detail: {
          get progress() {
            return e.progress;
          },
          get caption() {
            return e.caption;
          }
        }
      })
    );
  }
  notifyDone() {
    this.dispatchEvent(new CustomEvent("done"));
  }
}
export {
  f as EmscriptenDownloadMonitor,
  p as ProgressObserver,
  u as ProgressTracker,
  c as cloneResponseMonitorProgress
};
