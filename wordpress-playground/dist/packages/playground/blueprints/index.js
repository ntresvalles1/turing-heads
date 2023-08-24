const ys = async (t, { pluginPath: e, pluginName: r }, n) => {
  n?.tracker.setCaption(`Activating ${r || e}`);
  const s = [
    `${await t.documentRoot}/wp-load.php`,
    `${await t.documentRoot}/wp-admin/includes/plugin.php`
  ];
  if (!s.every(
    (a) => t.fileExists(a)
  ))
    throw new Error(
      `Required WordPress files do not exist: ${s.join(", ")}`
    );
  if ((await t.run({
    code: `<?php
define( 'WP_ADMIN', true );
${s.map((a) => `require_once( '${a}' );`).join(`
`)}
$plugin_path = '${e}';
if (!is_dir($plugin_path)) {
	activate_plugin($plugin_path);
	return;
}
// Find plugin entry file
foreach ( ( glob( $plugin_path . '/*.php' ) ?: array() ) as $file ) {
	$info = get_plugin_data( $file, false, false );
	if ( ! empty( $info['Name'] ) ) {
		activate_plugin( $file );
		return;
	}
}
echo 'NO_ENTRY_FILE';
`
  })).text.endsWith("NO_ENTRY_FILE"))
    throw new Error("Could not find plugin entry file.");
}, gs = async (t, { themeFolderName: e }, r) => {
  r?.tracker.setCaption(`Activating ${e}`);
  const n = `${await t.documentRoot}/wp-load.php`;
  if (!t.fileExists(n))
    throw new Error(
      `Required WordPress file does not exist: ${n}`
    );
  await t.run({
    code: `<?php
define( 'WP_ADMIN', true );
require_once( '${n}' );
switch_theme( '${e}' );
`
  });
};
function dr(t) {
  const e = t.split(".").shift().replace(/-/g, " ");
  return e.charAt(0).toUpperCase() + e.slice(1).toLowerCase();
}
async function Ft(t, e, r) {
  let n = "";
  await t.fileExists(e) && (n = await t.readFileAsText(e)), await t.writeFile(e, r(n));
}
async function si(t) {
  return new Uint8Array(await t.arrayBuffer());
}
class ii extends File {
  constructor(e, r) {
    super(e, r), this.buffers = e;
  }
  async arrayBuffer() {
    return this.buffers[0];
  }
}
const Or = File.prototype.arrayBuffer instanceof Function ? File : ii, An = "/vfs-blueprints", Cr = async (t, { consts: e, virtualize: r = !1 }) => {
  const n = await t.documentRoot, s = r ? An : n, i = `${s}/playground-consts.json`, c = `${s}/wp-config.php`;
  return r && (t.mkdir(An), t.setPhpIniEntry("auto_prepend_file", c)), await Ft(
    t,
    i,
    (a) => JSON.stringify({
      ...JSON.parse(a || "{}"),
      ...e
    })
  ), await Ft(t, c, (a) => a.includes("playground-consts.json") ? a : `<?php
	$consts = json_decode(file_get_contents('${i}'), true);
	foreach ($consts as $const => $value) {
		if (!defined($const)) {
			define($const, $value);
		}
	}
?>${a}`), c;
}, oi = async (t, e) => {
  const r = new ai(
    t,
    e.wordpressPath || "/wordpress",
    e.siteUrl
  );
  e.addPhpInfo === !0 && await r.addPhpInfo(), e.siteUrl && await r.patchSiteUrl(), e.patchSecrets === !0 && await r.patchSecrets(), e.disableSiteHealth === !0 && await r.disableSiteHealth(), e.disableWpNewBlogNotification === !0 && await r.disableWpNewBlogNotification();
};
class ai {
  constructor(e, r, n) {
    this.php = e, this.scopedSiteUrl = n, this.wordpressPath = r;
  }
  async addPhpInfo() {
    await this.php.writeFile(
      `${this.wordpressPath}/phpinfo.php`,
      "<?php phpinfo(); "
    );
  }
  async patchSiteUrl() {
    await Cr(this.php, {
      consts: {
        WP_HOME: this.scopedSiteUrl,
        WP_SITEURL: this.scopedSiteUrl
      },
      virtualize: !0
    });
  }
  async patchSecrets() {
    await Ft(
      this.php,
      `${this.wordpressPath}/wp-config.php`,
      (e) => `<?php
					define('AUTH_KEY',         '${et(40)}');
					define('SECURE_AUTH_KEY',  '${et(40)}');
					define('LOGGED_IN_KEY',    '${et(40)}');
					define('NONCE_KEY',        '${et(40)}');
					define('AUTH_SALT',        '${et(40)}');
					define('SECURE_AUTH_SALT', '${et(40)}');
					define('LOGGED_IN_SALT',   '${et(40)}');
					define('NONCE_SALT',       '${et(40)}');
				?>${e.replaceAll("', 'put your unique phrase here'", "__', ''")}`
    );
  }
  async disableSiteHealth() {
    await Ft(
      this.php,
      `${this.wordpressPath}/wp-includes/default-filters.php`,
      (e) => e.replace(
        /add_filter[^;]+wp_maybe_grant_site_health_caps[^;]+;/i,
        ""
      )
    );
  }
  async disableWpNewBlogNotification() {
    await Ft(
      this.php,
      `${this.wordpressPath}/wp-config.php`,
      // The original version of this function crashes WASM PHP, let's define an empty one instead.
      (e) => `${e} function wp_new_blog_notification(...$args){} `
    );
  }
}
function et(t) {
  const e = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+=-[]/.,<>?";
  let r = "";
  for (let n = t; n > 0; --n)
    r += e[Math.floor(Math.random() * e.length)];
  return r;
}
const ci = async (t, { code: e }) => await t.run({ code: e }), li = async (t, { options: e }) => await t.run(e), ui = async (t, { key: e, value: r }) => {
  await t.setPhpIniEntry(e, r);
}, di = async (t, { request: e }) => await t.request(e), fi = async (t, { fromPath: e, toPath: r }) => {
  await t.writeFile(
    r,
    await t.readFileAsBuffer(e)
  );
}, pi = async (t, { fromPath: e, toPath: r }) => {
  await t.mv(e, r);
}, hi = async (t, { path: e }) => {
  await t.mkdir(e);
}, mi = async (t, { path: e }) => {
  await t.unlink(e);
}, yi = async (t, { path: e }) => {
  await t.rmdir(e);
}, vs = async (t, { path: e, data: r }) => {
  r instanceof File && (r = await si(r)), await t.writeFile(e, r);
}, gi = async (t, { siteUrl: e }) => await Cr(t, {
  consts: {
    WP_HOME: e,
    WP_SITEURL: e
  }
});
class $s {
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
    const r = await this.acquire();
    try {
      return await e();
    } finally {
      r();
    }
  }
}
const vi = Symbol("literal");
function Et(t) {
  if (typeof t == "string")
    return t.startsWith("$") ? t : JSON.stringify(t);
  if (typeof t == "number")
    return t.toString();
  if (Array.isArray(t))
    return `array(${t.map(Et).join(", ")})`;
  if (t === null)
    return "null";
  if (typeof t == "object")
    return vi in t ? t.toString() : `array(${Object.entries(t).map(([r, n]) => `${JSON.stringify(r)} => ${Et(n)}`).join(", ")})`;
  if (typeof t == "function")
    return t();
  throw new Error(`Unsupported value: ${t}`);
}
function jr(t) {
  const e = {};
  for (const r in t)
    e[r] = Et(t[r]);
  return e;
}
const Dn = `<?php

function zipDir($dir, $output, $additionalFiles = array())
{
    $zip = new ZipArchive;
    $res = $zip->open($output, ZipArchive::CREATE);
    if ($res === TRUE) {
        foreach ($additionalFiles as $file) {
            $zip->addFile($file);
        }
        $directories = array(
            rtrim($dir, '/') . '/'
        );
        while (sizeof($directories)) {
            $dir = array_pop($directories);

            if ($handle = opendir($dir)) {
                while (false !== ($entry = readdir($handle))) {
                    if ($entry == '.' || $entry == '..') {
                        continue;
                    }

                    $entry = $dir . $entry;

                    if (is_dir($entry)) {
                        $directory_path = $entry . '/';
                        array_push($directories, $directory_path);
                    } else if (is_file($entry)) {
                        $zip->addFile($entry);
                    }
                }
                closedir($handle);
            }
        }
        $zip->close();
        chmod($output, 0777);
    }
}

function unzip($zipPath, $extractTo, $overwrite = true)
{
    if(!is_dir($extractTo)) {
        mkdir($extractTo, 0777, true);
    }
    $zip = new ZipArchive;
    $res = $zip->open($zipPath);
    if ($res === TRUE) {
        $zip->extractTo($extractTo);
        $zip->close();
        chmod($extractTo, 0777);
    }
}


function delTree($dir)
{
    $files = array_diff(scandir($dir), array('.', '..'));
    foreach ($files as $file) {
        (is_dir("$dir/$file")) ? delTree("$dir/$file") : unlink("$dir/$file");
    }
    return rmdir($dir);
}
`;
async function $i(t) {
  const e = "wordpress-playground.zip", r = `/tmp/${e}`, n = jr({
    zipPath: r,
    documentRoot: await t.documentRoot
  });
  await _s(
    t,
    `zipDir(${n.documentRoot}, ${n.zipPath});`
  );
  const s = await t.readFileAsBuffer(r);
  return t.unlink(r), new File([s], e);
}
const _i = async (t, { fullSiteZip: e }) => {
  const r = "/import.zip";
  await t.writeFile(
    r,
    new Uint8Array(await e.arrayBuffer())
  );
  const n = await t.absoluteUrl, s = await t.documentRoot;
  await t.rmdir(s), await kr(t, { zipPath: r, extractToPath: "/" });
  const i = jr({ absoluteUrl: n });
  await Pi(
    t,
    `${s}/wp-config.php`,
    (c) => `<?php
			if(!defined('WP_HOME')) {
				define('WP_HOME', ${i.absoluteUrl});
				define('WP_SITEURL', ${i.absoluteUrl});
			}
			?>${c}`
  );
}, kr = async (t, { zipPath: e, extractToPath: r }) => {
  const n = jr({
    zipPath: e,
    extractToPath: r
  });
  await _s(
    t,
    `unzip(${n.zipPath}, ${n.extractToPath});`
  );
}, wi = async (t, { file: e }) => {
  const r = await t.request({
    url: "/wp-admin/admin.php?import=wordpress"
  }), n = Fn(r).getElementById("import-upload-form")?.getAttribute("action"), s = await t.request({
    url: `/wp-admin/${n}`,
    method: "POST",
    files: { import: e }
  }), i = Fn(s).querySelector(
    "#wpbody-content form"
  );
  if (!i)
    throw console.log(s.text), new Error(
      "Could not find an importer form in response. See the response text above for details."
    );
  const c = bi(i);
  c.fetch_attachments = "1";
  for (const a in c)
    if (a.startsWith("user_map[")) {
      const u = "user_new[" + a.slice(9, -1) + "]";
      c[u] = "1";
    }
  await t.request({
    url: i.action,
    method: "POST",
    formData: c
  });
};
function Fn(t) {
  return new DOMParser().parseFromString(t.text, "text/html");
}
function bi(t) {
  return Object.fromEntries(new FormData(t).entries());
}
async function Pi(t, e, r) {
  await t.writeFile(
    e,
    r(await t.readFileAsText(e))
  );
}
async function _s(t, e) {
  const r = await t.run({
    code: Dn + e
  });
  if (r.exitCode !== 0)
    throw console.log(Dn + e), console.log(e + ""), console.log(r.errors), r.errors;
  return r;
}
async function ws(t, { targetPath: e, zipFile: r }) {
  const n = r.name, s = n.replace(/\.zip$/, ""), i = `/tmp/assets/${s}`, c = `/tmp/${n}`, a = () => t.rmdir(i, {
    recursive: !0
  });
  await t.fileExists(i) && await a(), await vs(t, {
    path: c,
    data: r
  });
  const u = () => Promise.all([a, () => t.unlink(c)]);
  try {
    await kr(t, {
      zipPath: c,
      extractToPath: i
    });
    const d = await t.listFiles(i, {
      prependPath: !0
    }), f = d.length === 1 && await t.isDir(d[0]);
    let g, R = "";
    f ? (R = d[0], g = d[0].split("/").pop()) : (R = i, g = s);
    const E = `${e}/${g}`;
    return await t.mv(R, E), await u(), {
      assetFolderPath: E,
      assetFolderName: g
    };
  } catch (d) {
    throw await u(), d;
  }
}
const Ei = async (t, { pluginZipFile: e, options: r = {} }, n) => {
  const s = e.name.split("/").pop() || "plugin.zip", i = dr(s);
  n?.tracker.setCaption(`Installing the ${i} plugin`);
  try {
    const { assetFolderPath: c } = await ws(t, {
      zipFile: e,
      targetPath: `${await t.documentRoot}/wp-content/plugins`
    });
    ("activate" in r ? r.activate : !0) && await ys(
      t,
      {
        pluginPath: c,
        pluginName: i
      },
      n
    ), await Si(t);
  } catch (c) {
    console.error(
      `Proceeding without the ${i} plugin. Could not install it in wp-admin. The original error was: ${c}`
    ), console.error(c);
  }
};
async function Si(t) {
  await t.isDir("/wordpress/wp-content/plugins/gutenberg") && !await t.fileExists("/wordpress/.gutenberg-patched") && (await t.writeFile("/wordpress/.gutenberg-patched", "1"), await Mn(
    t,
    "/wordpress/wp-content/plugins/gutenberg/build/block-editor/index.js",
    (e) => e.replace(
      /srcDoc:("[^"]+"|[^,]+)/g,
      'src:"/wp-includes/empty.html"'
    )
  ), await Mn(
    t,
    "/wordpress/wp-content/plugins/gutenberg/build/block-editor/index.min.js",
    (e) => e.replace(
      /srcDoc:("[^"]+"|[^,]+)/g,
      'src:"/wp-includes/empty.html"'
    )
  ));
}
async function Mn(t, e, r) {
  return await t.writeFile(
    e,
    r(await t.readFileAsText(e))
  );
}
const Ti = async (t, { themeZipFile: e, options: r = {} }, n) => {
  const s = dr(e.name);
  n?.tracker.setCaption(`Installing the ${s} theme`);
  try {
    const { assetFolderName: i } = await ws(t, {
      zipFile: e,
      targetPath: `${await t.documentRoot}/wp-content/themes`
    });
    ("activate" in r ? r.activate : !0) && await gs(
      t,
      {
        themeFolderName: i
      },
      n
    );
  } catch (i) {
    console.error(
      `Proceeding without the ${s} theme. Could not install it in wp-admin. The original error was: ${i}`
    ), console.error(i);
  }
}, Ri = async (t, { username: e = "admin", password: r = "password" } = {}, n) => {
  n?.tracker.setCaption(n?.initialCaption || "Logging in"), await t.request({
    url: "/wp-login.php"
  }), await t.request({
    url: "/wp-login.php",
    method: "POST",
    formData: {
      log: e,
      pwd: r,
      rememberme: "forever"
    }
  });
}, Ni = async (t, { options: e }) => {
  await t.request({
    url: "/wp-admin/install.php?step=2",
    method: "POST",
    formData: {
      language: "en",
      prefix: "wp_",
      weblog_title: "My WordPress Website",
      user_name: e.adminPassword || "admin",
      admin_password: e.adminPassword || "password",
      // The installation wizard demands typing the same password twice
      admin_password2: e.adminPassword || "password",
      Submit: "Install WordPress",
      pw_weak: "1",
      admin_email: "admin@localhost.com"
    }
  });
}, Oi = async (t, { options: e }) => {
  const r = `<?php
	include 'wordpress/wp-load.php';
	$site_options = ${Et(e)};
	foreach($site_options as $name => $value) {
		update_option($name, $value);
	}
	echo "Success";
	`, n = await t.run({
    code: r
  });
  return bs(n), { code: r, result: n };
}, Ci = async (t, { meta: e, userId: r }) => {
  const n = `<?php
	include 'wordpress/wp-load.php';
	$meta = ${Et(e)};
	foreach($meta as $name => $value) {
		update_user_meta(${Et(r)}, $name, $value);
	}
	echo "Success";
	`, s = await t.run({
    code: n
  });
  return bs(s), { code: n, result: s };
};
async function bs(t) {
  if (t.text !== "Success")
    throw console.log(t), new Error(`Failed to run code: ${t.text} ${t.errors}`);
}
const ji = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  activatePlugin: ys,
  activateTheme: gs,
  applyWordPressPatches: oi,
  cp: fi,
  defineSiteUrl: gi,
  defineWpConfigConsts: Cr,
  importFile: wi,
  installPlugin: Ei,
  installTheme: Ti,
  login: Ri,
  mkdir: hi,
  mv: pi,
  replaceSite: _i,
  request: di,
  rm: mi,
  rmdir: yi,
  runPHP: ci,
  runPHPWithOptions: li,
  runWpInstallationWizard: Ni,
  setPhpIniEntry: ui,
  setSiteOptions: Oi,
  unzip: kr,
  updateUserMeta: Ci,
  writeFile: vs,
  zipEntireSite: $i
}, Symbol.toStringTag, { value: "Module" })), ki = 5 * 1024 * 1024;
function Ii(t, e) {
  const r = t.headers.get("content-length") || "", n = parseInt(r, 10) || ki;
  function s(i, c) {
    e(
      new CustomEvent("progress", {
        detail: {
          loaded: i,
          total: c
        }
      })
    );
  }
  return new Response(
    new ReadableStream({
      async start(i) {
        if (!t.body) {
          i.close();
          return;
        }
        const c = t.body.getReader();
        let a = 0;
        for (; ; )
          try {
            const { done: u, value: d } = await c.read();
            if (d && (a += d.byteLength), u) {
              s(a, a), i.close();
              break;
            } else
              s(a, n), i.enqueue(d);
          } catch (u) {
            console.error({ e: u }), i.error(u);
            break;
          }
      }
    }),
    {
      status: t.status,
      statusText: t.statusText,
      headers: t.headers
    }
  );
}
const gr = 1e-5;
class Ir extends EventTarget {
  constructor({
    weight: e = 1,
    caption: r = "",
    fillTime: n = 4
  } = {}) {
    super(), this._selfWeight = 1, this._selfDone = !1, this._selfProgress = 0, this._selfCaption = "", this._isFilling = !1, this._subTrackers = [], this._weight = e, this._selfCaption = r, this._fillTime = n;
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
  stage(e, r = "") {
    if (e || (e = this._selfWeight), this._selfWeight - e < -gr)
      throw new Error(
        `Cannot add a stage with weight ${e} as the total weight of registered stages would exceed 1.`
      );
    this._selfWeight -= e;
    const n = new Ir({
      caption: r,
      weight: e,
      fillTime: this._fillTime
    });
    return this._subTrackers.push(n), n.addEventListener("progress", () => this.notifyProgress()), n.addEventListener("done", () => {
      this.done && this.notifyDone();
    }), n;
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
    const r = 100, n = this._fillTime / r;
    this._fillInterval = setInterval(() => {
      this.set(this._selfProgress + 1), e && this._selfProgress >= 99 && clearInterval(this._fillInterval);
    }, n);
  }
  set(e) {
    this._selfProgress = Math.min(e, 100), this.notifyProgress(), this._selfProgress + gr >= 100 && this.finish();
  }
  finish() {
    this._fillInterval && clearInterval(this._fillInterval), this._selfDone = !0, this._selfProgress = 100, this._isFilling = !1, this._fillInterval = void 0, this.notifyProgress(), this.notifyDone();
  }
  get caption() {
    for (let e = this._subTrackers.length - 1; e >= 0; e--)
      if (!this._subTrackers[e].done) {
        const r = this._subTrackers[e].caption;
        if (r)
          return r;
      }
    return this._selfCaption;
  }
  setCaption(e) {
    this._selfCaption = e, this.notifyProgress();
  }
  get done() {
    return this.progress + gr >= 100;
  }
  get progress() {
    if (this._selfDone)
      return 100;
    const e = this._subTrackers.reduce(
      (r, n) => r + n.progress * n.weight,
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
    }), this.addEventListener("progress", (r) => {
      e.setProgress({
        progress: r.detail.progress,
        caption: r.detail.caption
      });
    }), this.addEventListener("done", () => {
      e.setLoaded();
    });
  }
  addEventListener(e, r) {
    super.addEventListener(e, r);
  }
  removeEventListener(e, r) {
    super.removeEventListener(e, r);
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
const qn = Symbol("error"), Un = Symbol("message");
class Ar extends Event {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param type The name of the event
   * @param options A dictionary object that allows for setting
   *                  attributes via object members of the same name.
   */
  constructor(e, r = {}) {
    super(e), this[qn] = r.error === void 0 ? null : r.error, this[Un] = r.message === void 0 ? "" : r.message;
  }
  get error() {
    return this[qn];
  }
  get message() {
    return this[Un];
  }
}
Object.defineProperty(Ar.prototype, "error", { enumerable: !0 });
Object.defineProperty(Ar.prototype, "message", { enumerable: !0 });
const Ai = typeof globalThis.ErrorEvent == "function" ? globalThis.ErrorEvent : Ar;
function Di(t) {
  return t instanceof Error ? "exitCode" in t && t?.exitCode === 0 || t?.name === "ExitStatus" && "status" in t && t.status === 0 : !1;
}
class Fi extends EventTarget {
  constructor() {
    super(...arguments), this.listenersCount = 0;
  }
  addEventListener(e, r) {
    ++this.listenersCount, super.addEventListener(e, r);
  }
  removeEventListener(e, r) {
    --this.listenersCount, super.removeEventListener(e, r);
  }
  hasListeners() {
    return this.listenersCount > 0;
  }
}
function Mi(t) {
  t.asm = {
    ...t.asm
  };
  const e = new Fi();
  for (const r in t.asm)
    if (typeof t.asm[r] == "function") {
      const n = t.asm[r];
      t.asm[r] = function(...s) {
        try {
          return n(...s);
        } catch (i) {
          if (!(i instanceof Error))
            throw i;
          const c = Ui(
            i,
            t.lastAsyncifyStackSource?.stack
          );
          if (t.lastAsyncifyStackSource && (i.cause = t.lastAsyncifyStackSource), e.hasListeners()) {
            e.dispatchEvent(
              new Ai("error", {
                error: i,
                message: c
              })
            );
            return;
          }
          throw Di(i) || zi(c), i;
        }
      };
    }
  return e;
}
let wr = [];
function qi() {
  return wr;
}
function Ui(t, e) {
  if (t.message === "unreachable") {
    let r = Li;
    e || (r += `

This stack trace is lacking. For a better one initialize 
the PHP runtime with { debug: true }, e.g. PHPNode.load('8.1', { debug: true }).

`), wr = Hi(
      e || t.stack || ""
    );
    for (const n of wr)
      r += `    * ${n}
`;
    return r;
  }
  return t.message;
}
const Li = `
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

`, Ln = "\x1B[41m", Vi = "\x1B[1m", Vn = "\x1B[0m", zn = "\x1B[K";
let Hn = !1;
function zi(t) {
  if (!Hn) {
    Hn = !0, console.log(`${Ln}
${zn}
${Vi}  WASM ERROR${Vn}${Ln}`);
    for (const e of t.split(`
`))
      console.log(`${zn}  ${e} `);
    console.log(`${Vn}`);
  }
}
function Hi(t) {
  try {
    const e = t.split(`
`).slice(1).map((r) => {
      const n = r.trim().substring(3).split(" ");
      return {
        fn: n.length >= 2 ? n[0] : "<unknown>",
        isWasm: r.includes("wasm://")
      };
    }).filter(
      ({ fn: r, isWasm: n }) => n && !r.startsWith("dynCall_") && !r.startsWith("invoke_")
    ).map(({ fn: r }) => r);
    return Array.from(new Set(e));
  } catch {
    return [];
  }
}
class bt {
  constructor(e, r, n, s = "", i = 0) {
    this.httpStatusCode = e, this.headers = r, this.bytes = n, this.exitCode = i, this.errors = s;
  }
  static fromRawData(e) {
    return new bt(
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
const Ps = [
  "8.2",
  "8.1",
  "8.0",
  "7.4",
  "7.3",
  "7.2",
  "7.1",
  "7.0",
  "5.6"
], Ki = Ps[0];
class Wi {
  #e;
  #t;
  /**
   * @param  server - The PHP server to browse.
   * @param  config - The browser configuration.
   */
  constructor(e, r = {}) {
    this.requestHandler = e, this.#e = {}, this.#t = {
      handleRedirects: !1,
      maxRedirects: 4,
      ...r
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
  async request(e, r = 0) {
    const n = await this.requestHandler.request({
      ...e,
      headers: {
        ...e.headers,
        cookie: this.#r()
      }
    });
    if (n.headers["set-cookie"] && this.#n(n.headers["set-cookie"]), this.#t.handleRedirects && n.headers.location && r < this.#t.maxRedirects) {
      const s = new URL(
        n.headers.location[0],
        this.requestHandler.absoluteUrl
      );
      return this.request(
        {
          url: s.toString(),
          method: "GET",
          headers: {}
        },
        r + 1
      );
    }
    return n;
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
  #n(e) {
    for (const r of e)
      try {
        if (!r.includes("="))
          continue;
        const n = r.indexOf("="), s = r.substring(0, n), i = r.substring(n + 1).split(";")[0];
        this.#e[s] = i;
      } catch (n) {
        console.error(n);
      }
  }
  #r() {
    const e = [];
    for (const r in this.#e)
      e.push(`${r}=${this.#e[r]}`);
    return e.join("; ");
  }
}
const Gi = "http://example.com";
function Kn(t) {
  return t.toString().substring(t.origin.length);
}
function Wn(t, e) {
  return !e || !t.startsWith(e) ? t : t.substring(e.length);
}
function Bi(t, e) {
  return !e || t.startsWith(e) ? t : e + t;
}
class Ji {
  #e;
  #t;
  #n;
  #r;
  #i;
  #s;
  #o;
  #a;
  #c;
  /**
   * @param  php    - The PHP instance.
   * @param  config - Request Handler configuration.
   */
  constructor(e, r = {}) {
    this.#a = new $s({ concurrency: 1 });
    const {
      documentRoot: n = "/www/",
      absoluteUrl: s = typeof location == "object" ? location?.href : "",
      isStaticFilePath: i = () => !1
    } = r;
    this.php = e, this.#e = n, this.#c = i;
    const c = new URL(s);
    this.#n = c.hostname, this.#r = c.port ? Number(c.port) : c.protocol === "https:" ? 443 : 80, this.#t = (c.protocol || "").replace(":", "");
    const a = this.#r !== 443 && this.#r !== 80;
    this.#i = [
      this.#n,
      a ? `:${this.#r}` : ""
    ].join(""), this.#s = c.pathname.replace(/\/+$/, ""), this.#o = [
      `${this.#t}://`,
      this.#i,
      this.#s
    ].join("");
  }
  /** @inheritDoc */
  pathToInternalUrl(e) {
    return `${this.absoluteUrl}${e}`;
  }
  /** @inheritDoc */
  internalUrlToPath(e) {
    const r = new URL(e);
    return r.pathname.startsWith(this.#s) && (r.pathname = r.pathname.slice(this.#s.length)), Kn(r);
  }
  get isRequestRunning() {
    return this.#a.running > 0;
  }
  /** @inheritDoc */
  get absoluteUrl() {
    return this.#o;
  }
  /** @inheritDoc */
  get documentRoot() {
    return this.#e;
  }
  /** @inheritDoc */
  async request(e) {
    const r = e.url.startsWith("http://") || e.url.startsWith("https://"), n = new URL(
      e.url,
      r ? void 0 : Gi
    ), s = Wn(
      n.pathname,
      this.#s
    );
    return this.#c(s) ? this.#l(s) : await this.#u(e, n);
  }
  /**
   * Serves a static file from the PHP filesystem.
   *
   * @param  path - The requested static file path.
   * @returns The response.
   */
  #l(e) {
    const r = `${this.#e}${e}`;
    if (!this.php.fileExists(r))
      return new bt(
        404,
        {},
        new TextEncoder().encode("404 File not found")
      );
    const n = this.php.readFileAsBuffer(r);
    return new bt(
      200,
      {
        "content-length": [`${n.byteLength}`],
        // @TODO: Infer the content-type from the arrayBuffer instead of the file path.
        //        The code below won't return the correct mime-type if the extension
        //        was tampered with.
        "content-type": [xi(r)],
        "accept-ranges": ["bytes"],
        "cache-control": ["public, max-age=0"]
      },
      n
    );
  }
  /**
   * Runs the requested PHP file with all the request and $_SERVER
   * superglobals populated.
   *
   * @param  request - The request.
   * @returns The response.
   */
  async #u(e, r) {
    const n = await this.#a.acquire();
    try {
      this.php.addServerGlobalEntry("DOCUMENT_ROOT", this.#e), this.php.addServerGlobalEntry(
        "HTTPS",
        this.#o.startsWith("https://") ? "on" : ""
      );
      let s = "GET";
      const i = {
        host: this.#i,
        ...Es(e.headers || {})
      }, c = [];
      if (e.files && Object.keys(e.files).length) {
        s = "POST";
        for (const d in e.files) {
          const f = e.files[d];
          c.push({
            key: d,
            name: f.name,
            type: f.type,
            data: new Uint8Array(await f.arrayBuffer())
          });
        }
        i["content-type"]?.startsWith("multipart/form-data") && (e.formData = Yi(
          e.body || ""
        ), i["content-type"] = "application/x-www-form-urlencoded", delete e.body);
      }
      let a;
      e.formData !== void 0 ? (s = "POST", i["content-type"] = i["content-type"] || "application/x-www-form-urlencoded", a = new URLSearchParams(
        e.formData
      ).toString()) : a = e.body;
      let u;
      try {
        u = this.#d(r.pathname);
      } catch {
        return new bt(
          404,
          {},
          new TextEncoder().encode("404 File not found")
        );
      }
      return await this.php.run({
        relativeUri: Bi(
          Kn(r),
          this.#s
        ),
        protocol: this.#t,
        method: e.method || s,
        body: a,
        fileInfos: c,
        scriptPath: u,
        headers: i
      });
    } finally {
      n();
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
  #d(e) {
    let r = Wn(e, this.#s);
    r.includes(".php") ? r = r.split(".php")[0] + ".php" : (r.endsWith("/") || (r += "/"), r.endsWith("index.php") || (r += "index.php"));
    const n = `${this.#e}${r}`;
    if (this.php.fileExists(n))
      return n;
    if (!this.php.fileExists(`${this.#e}/index.php`))
      throw new Error(`File not found: ${n}`);
    return `${this.#e}/index.php`;
  }
}
function Yi(t) {
  const e = {}, r = t.match(/--(.*)\r\n/);
  if (!r)
    return e;
  const n = r[1], s = t.split(`--${n}`);
  return s.shift(), s.pop(), s.forEach((i) => {
    const c = i.indexOf(`\r
\r
`), a = i.substring(0, c).trim(), u = i.substring(c + 4).trim(), d = a.match(/name="([^"]+)"/);
    if (d) {
      const f = d[1];
      e[f] = u;
    }
  }), e;
}
function xi(t) {
  switch (t.split(".").pop()) {
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
const Gn = {
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
function qe(t = "") {
  return function(r, n, s) {
    const i = s.value;
    s.value = function(...c) {
      try {
        return i.apply(this, c);
      } catch (a) {
        const u = typeof a == "object" ? a?.errno : null;
        if (u in Gn) {
          const d = Gn[u], f = typeof c[0] == "string" ? c[0] : null, g = f !== null ? t.replaceAll("{path}", f) : t;
          throw new Error(`${g}: ${d}`, {
            cause: a
          });
        }
        throw a;
      }
    };
  };
}
const Zi = [];
function Qi(t) {
  return Zi[t];
}
(function() {
  return typeof process < "u" && process.release?.name === "node" ? "NODE" : typeof window < "u" ? "WEB" : typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope ? "WORKER" : "NODE";
})();
var Xi = Object.defineProperty, eo = Object.getOwnPropertyDescriptor, Ue = (t, e, r, n) => {
  for (var s = n > 1 ? void 0 : n ? eo(e, r) : e, i = t.length - 1, c; i >= 0; i--)
    (c = t[i]) && (s = (n ? c(e, r, s) : c(s)) || s);
  return n && s && Xi(e, r, s), s;
};
const Ee = "string", $t = "number", ie = Symbol("__private__dont__use");
class Le {
  /**
   * Initializes a PHP runtime.
   *
   * @internal
   * @param  PHPRuntime - Optional. PHP Runtime ID as initialized by loadPHPRuntime.
   * @param  serverOptions - Optional. Options for the PHPRequestHandler. If undefined, no request handler will be initialized.
   */
  constructor(e, r) {
    this.#e = [], this.#t = !1, this.#n = null, this.#r = {}, this.#i = [], e !== void 0 && this.initializeRuntime(e), r && (this.requestHandler = new Wi(
      new Ji(this, r)
    ));
  }
  #e;
  #t;
  #n;
  #r;
  #i;
  /** @inheritDoc */
  async onMessage(e) {
    this.#i.push(e);
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
    if (this[ie])
      throw new Error("PHP runtime already initialized.");
    const r = Qi(e);
    if (!r)
      throw new Error("Invalid PHP runtime id.");
    this[ie] = r, r.onMessage = (n) => {
      for (const s of this.#i)
        s(n);
    }, this.#n = Mi(r);
  }
  /** @inheritDoc */
  setPhpIniPath(e) {
    if (this.#t)
      throw new Error("Cannot set PHP ini path after calling run().");
    this[ie].ccall(
      "wasm_set_phpini_path",
      null,
      ["string"],
      [e]
    );
  }
  /** @inheritDoc */
  setPhpIniEntry(e, r) {
    if (this.#t)
      throw new Error("Cannot set PHP ini entries after calling run().");
    this.#e.push([e, r]);
  }
  /** @inheritDoc */
  chdir(e) {
    this[ie].FS.chdir(e);
  }
  /** @inheritDoc */
  async request(e, r) {
    if (!this.requestHandler)
      throw new Error("No request handler available.");
    return this.requestHandler.request(e, r);
  }
  /** @inheritDoc */
  async run(e) {
    this.#t || (this.#s(), this.#t = !0), this.#f(e.scriptPath || ""), this.#a(e.relativeUri || ""), this.#l(e.method || "GET");
    const { host: r, ...n } = {
      host: "example.com:443",
      ...Es(e.headers || {})
    };
    if (this.#c(r, e.protocol || "http"), this.#u(n), e.body && this.#d(e.body), e.fileInfos)
      for (const s of e.fileInfos)
        this.#h(s);
    return e.code && this.#m(" ?>" + e.code), this.#p(), await this.#y();
  }
  #s() {
    if (this.#e.length > 0) {
      const e = this.#e.map(([r, n]) => `${r}=${n}`).join(`
`) + `

`;
      this[ie].ccall(
        "wasm_set_phpini_entries",
        null,
        [Ee],
        [e]
      );
    }
    this[ie].ccall("php_wasm_init", null, [], []);
  }
  #o() {
    const e = "/tmp/headers.json";
    if (!this.fileExists(e))
      throw new Error(
        "SAPI Error: Could not find response headers file."
      );
    const r = JSON.parse(this.readFileAsText(e)), n = {};
    for (const s of r.headers) {
      if (!s.includes(": "))
        continue;
      const i = s.indexOf(": "), c = s.substring(0, i).toLowerCase(), a = s.substring(i + 2);
      c in n || (n[c] = []), n[c].push(a);
    }
    return {
      headers: n,
      httpStatusCode: r.status
    };
  }
  #a(e) {
    if (this[ie].ccall(
      "wasm_set_request_uri",
      null,
      [Ee],
      [e]
    ), e.includes("?")) {
      const r = e.substring(e.indexOf("?") + 1);
      this[ie].ccall(
        "wasm_set_query_string",
        null,
        [Ee],
        [r]
      );
    }
  }
  #c(e, r) {
    this[ie].ccall(
      "wasm_set_request_host",
      null,
      [Ee],
      [e]
    );
    let n;
    try {
      n = parseInt(new URL(e).port, 10);
    } catch {
    }
    (!n || isNaN(n) || n === 80) && (n = r === "https" ? 443 : 80), this[ie].ccall(
      "wasm_set_request_port",
      null,
      [$t],
      [n]
    ), (r === "https" || !r && n === 443) && this.addServerGlobalEntry("HTTPS", "on");
  }
  #l(e) {
    this[ie].ccall(
      "wasm_set_request_method",
      null,
      [Ee],
      [e]
    );
  }
  #u(e) {
    e.cookie && this[ie].ccall(
      "wasm_set_cookies",
      null,
      [Ee],
      [e.cookie]
    ), e["content-type"] && this[ie].ccall(
      "wasm_set_content_type",
      null,
      [Ee],
      [e["content-type"]]
    ), e["content-length"] && this[ie].ccall(
      "wasm_set_content_length",
      null,
      [$t],
      [parseInt(e["content-length"], 10)]
    );
    for (const r in e) {
      let n = "HTTP_";
      ["content-type", "content-length"].includes(r.toLowerCase()) && (n = ""), this.addServerGlobalEntry(
        `${n}${r.toUpperCase().replace(/-/g, "_")}`,
        e[r]
      );
    }
  }
  #d(e) {
    this[ie].ccall(
      "wasm_set_request_body",
      null,
      [Ee],
      [e]
    ), this[ie].ccall(
      "wasm_set_content_length",
      null,
      [$t],
      [new TextEncoder().encode(e).length]
    );
  }
  #f(e) {
    this[ie].ccall(
      "wasm_set_path_translated",
      null,
      [Ee],
      [e]
    );
  }
  addServerGlobalEntry(e, r) {
    this.#r[e] = r;
  }
  #p() {
    for (const e in this.#r)
      this[ie].ccall(
        "wasm_add_SERVER_entry",
        null,
        [Ee, Ee],
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
  #h(e) {
    const { key: r, name: n, type: s, data: i } = e, c = `/tmp/${Math.random().toFixed(20)}`;
    this.writeFile(c, i);
    const a = 0;
    this[ie].ccall(
      "wasm_add_uploaded_file",
      null,
      [Ee, Ee, Ee, Ee, $t, $t],
      [r, n, s, c, a, i.byteLength]
    );
  }
  #m(e) {
    this[ie].ccall(
      "wasm_set_php_code",
      null,
      [Ee],
      [e]
    );
  }
  async #y() {
    let e, r;
    try {
      e = await new Promise((i, c) => {
        r = (u) => {
          const d = new Error("Rethrown");
          d.cause = u.error, d.betterMessage = u.message, c(d);
        }, this.#n?.addEventListener(
          "error",
          r
        );
        const a = this[ie].ccall(
          "wasm_sapi_handle_request",
          $t,
          [],
          []
        );
        return a instanceof Promise ? a.then(i, c) : i(a);
      });
    } catch (i) {
      for (const d in this)
        typeof this[d] == "function" && (this[d] = () => {
          throw new Error(
            "PHP runtime has crashed – see the earlier error for details."
          );
        });
      this.functionsMaybeMissingFromAsyncify = qi();
      const c = i, a = "betterMessage" in c ? c.betterMessage : c.message, u = new Error(a);
      throw u.cause = c, u;
    } finally {
      this.#n?.removeEventListener("error", r), this.#r = {};
    }
    const { headers: n, httpStatusCode: s } = this.#o();
    return new bt(
      s,
      n,
      this.readFileAsBuffer("/tmp/stdout"),
      this.readFileAsText("/tmp/stderr"),
      e
    );
  }
  mkdir(e) {
    this[ie].FS.mkdirTree(e);
  }
  mkdirTree(e) {
    this.mkdir(e);
  }
  readFileAsText(e) {
    return new TextDecoder().decode(this.readFileAsBuffer(e));
  }
  readFileAsBuffer(e) {
    return this[ie].FS.readFile(e);
  }
  writeFile(e, r) {
    this[ie].FS.writeFile(e, r);
  }
  unlink(e) {
    this[ie].FS.unlink(e);
  }
  mv(e, r) {
    this[ie].FS.rename(e, r);
  }
  rmdir(e, r = { recursive: !0 }) {
    r?.recursive && this.listFiles(e).forEach((n) => {
      const s = `${e}/${n}`;
      this.isDir(s) ? this.rmdir(s, r) : this.unlink(s);
    }), this[ie].FS.rmdir(e);
  }
  listFiles(e, r = { prependPath: !1 }) {
    if (!this.fileExists(e))
      return [];
    try {
      const n = this[ie].FS.readdir(e).filter(
        (s) => s !== "." && s !== ".."
      );
      if (r.prependPath) {
        const s = e.replace(/\/$/, "");
        return n.map((i) => `${s}/${i}`);
      }
      return n;
    } catch (n) {
      return console.error(n, { path: e }), [];
    }
  }
  isDir(e) {
    return this.fileExists(e) ? this[ie].FS.isDir(
      this[ie].FS.lookupPath(e).node.mode
    ) : !1;
  }
  fileExists(e) {
    try {
      return this[ie].FS.lookupPath(e), !0;
    } catch {
      return !1;
    }
  }
}
Ue([
  qe('Could not create directory "{path}"')
], Le.prototype, "mkdir", 1);
Ue([
  qe('Could not create directory "{path}"')
], Le.prototype, "mkdirTree", 1);
Ue([
  qe('Could not read "{path}"')
], Le.prototype, "readFileAsText", 1);
Ue([
  qe('Could not read "{path}"')
], Le.prototype, "readFileAsBuffer", 1);
Ue([
  qe('Could not write to "{path}"')
], Le.prototype, "writeFile", 1);
Ue([
  qe('Could not unlink "{path}"')
], Le.prototype, "unlink", 1);
Ue([
  qe('Could not move "{path}"')
], Le.prototype, "mv", 1);
Ue([
  qe('Could not remove directory "{path}"')
], Le.prototype, "rmdir", 1);
Ue([
  qe('Could not list files in "{path}"')
], Le.prototype, "listFiles", 1);
Ue([
  qe('Could not stat "{path}"')
], Le.prototype, "isDir", 1);
Ue([
  qe('Could not stat "{path}"')
], Le.prototype, "fileExists", 1);
function Es(t) {
  const e = {};
  for (const r in t)
    e[r.toLowerCase()] = t[r];
  return e;
}
const to = [
  "vfs",
  "literal",
  "wordpress.org/themes",
  "wordpress.org/plugins",
  "url"
];
function ro(t) {
  return t && typeof t == "object" && typeof t.resource == "string" && to.includes(t.resource);
}
class mt {
  /**
   * Creates a new Resource based on the given file reference
   *
   * @param ref The file reference to create the Resource for
   * @param options Additional options for the Resource
   * @returns A new Resource instance
   */
  static create(e, { semaphore: r, progress: n }) {
    let s;
    switch (e.resource) {
      case "vfs":
        s = new no(e, n);
        break;
      case "literal":
        s = new so(e, n);
        break;
      case "wordpress.org/themes":
        s = new ao(e, n);
        break;
      case "wordpress.org/plugins":
        s = new co(e, n);
        break;
      case "url":
        s = new oo(e, n);
        break;
      default:
        throw new Error(`Invalid resource: ${e}`);
    }
    return s = new lo(s), r && (s = new uo(s, r)), s;
  }
  setPlayground(e) {
    this.playground = e;
  }
  /** Whether this Resource is loaded asynchronously */
  get isAsync() {
    return !1;
  }
}
class no extends mt {
  /**
   * Creates a new instance of `VFSResource`.
   * @param playground The playground client.
   * @param resource The VFS reference.
   * @param progress The progress tracker.
   */
  constructor(e, r) {
    super(), this.resource = e, this.progress = r;
  }
  /** @inheritDoc */
  async resolve() {
    const e = await this.playground.readFileAsBuffer(
      this.resource.path
    );
    return this.progress?.set(100), new Or([e], this.name);
  }
  /** @inheritDoc */
  get name() {
    return this.resource.path.split("/").pop() || "";
  }
}
class so extends mt {
  /**
   * Creates a new instance of `LiteralResource`.
   * @param resource The literal reference.
   * @param progress The progress tracker.
   */
  constructor(e, r) {
    super(), this.resource = e, this.progress = r;
  }
  /** @inheritDoc */
  async resolve() {
    return this.progress?.set(100), new Or([this.resource.contents], this.resource.name);
  }
  /** @inheritDoc */
  get name() {
    return this.resource.name;
  }
}
class Dr extends mt {
  /**
   * Creates a new instance of `FetchResource`.
   * @param progress The progress tracker.
   */
  constructor(e) {
    super(), this.progress = e;
  }
  /** @inheritDoc */
  async resolve() {
    this.progress?.setCaption(this.caption);
    const e = this.getURL();
    let r = await fetch(e);
    if (r = await Ii(
      r,
      this.progress?.loadingListener ?? io
    ), r.status !== 200)
      throw new Error(`Could not download "${e}"`);
    return new Or([await r.blob()], this.name);
  }
  /**
   * Gets the caption for the progress tracker.
   * @returns The caption.
   */
  get caption() {
    return `Downloading ${this.name}`;
  }
  /** @inheritDoc */
  get name() {
    try {
      return new URL(this.getURL(), "http://example.com").pathname.split("/").pop();
    } catch {
      return this.getURL();
    }
  }
  /** @inheritDoc */
  get isAsync() {
    return !0;
  }
}
const io = () => {
};
class oo extends Dr {
  /**
   * Creates a new instance of `UrlResource`.
   * @param resource The URL reference.
   * @param progress The progress tracker.
   */
  constructor(e, r) {
    super(r), this.resource = e;
  }
  /** @inheritDoc */
  getURL() {
    return this.resource.url;
  }
  /** @inheritDoc */
  get caption() {
    return this.resource.caption ?? super.caption;
  }
}
let Fr = "https://playground.wordpress.net/plugin-proxy";
function Ol(t) {
  Fr = t;
}
class ao extends Dr {
  constructor(e, r) {
    super(r), this.resource = e;
  }
  get name() {
    return dr(this.resource.slug);
  }
  getURL() {
    const e = Ss(this.resource.slug);
    return `${Fr}?theme=` + e;
  }
}
class co extends Dr {
  constructor(e, r) {
    super(r), this.resource = e;
  }
  /** @inheritDoc */
  get name() {
    return dr(this.resource.slug);
  }
  /** @inheritDoc */
  getURL() {
    const e = Ss(this.resource.slug);
    return `${Fr}?plugin=` + e;
  }
}
function Ss(t) {
  return !t || t.endsWith(".zip") ? t : t + ".latest-stable.zip";
}
class Ts extends mt {
  constructor(e) {
    super(), this.resource = e;
  }
  /** @inheritDoc */
  async resolve() {
    return this.resource.resolve();
  }
  /** @inheritDoc */
  async setPlayground(e) {
    return this.resource.setPlayground(e);
  }
  /** @inheritDoc */
  get progress() {
    return this.resource.progress;
  }
  /** @inheritDoc */
  set progress(e) {
    this.resource.progress = e;
  }
  /** @inheritDoc */
  get name() {
    return this.resource.name;
  }
  /** @inheritDoc */
  get isAsync() {
    return this.resource.isAsync;
  }
}
class lo extends Ts {
  /** @inheritDoc */
  async resolve() {
    return this.promise || (this.promise = super.resolve()), this.promise;
  }
}
class uo extends Ts {
  constructor(e, r) {
    super(e), this.semaphore = r;
  }
  /** @inheritDoc */
  async resolve() {
    return this.isAsync ? this.semaphore.run(() => super.resolve()) : super.resolve();
  }
}
var fo = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function po(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var br = { exports: {} }, Rs = {}, Ye = {}, lt = {}, Ht = {}, ee = {}, Vt = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.regexpCode = t.getEsmExportName = t.getProperty = t.safeStringify = t.stringify = t.strConcat = t.addCodeArg = t.str = t._ = t.nil = t._Code = t.Name = t.IDENTIFIER = t._CodeOrName = void 0;
  class e {
  }
  t._CodeOrName = e, t.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends e {
    constructor(j) {
      if (super(), !t.IDENTIFIER.test(j))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = j;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  t.Name = r;
  class n extends e {
    constructor(j) {
      super(), this._items = typeof j == "string" ? [j] : j;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const j = this._items[0];
      return j === "" || j === '""';
    }
    get str() {
      var j;
      return (j = this._str) !== null && j !== void 0 ? j : this._str = this._items.reduce((O, A) => `${O}${A}`, "");
    }
    get names() {
      var j;
      return (j = this._names) !== null && j !== void 0 ? j : this._names = this._items.reduce((O, A) => (A instanceof r && (O[A.str] = (O[A.str] || 0) + 1), O), {});
    }
  }
  t._Code = n, t.nil = new n("");
  function s(y, ...j) {
    const O = [y[0]];
    let A = 0;
    for (; A < j.length; )
      a(O, j[A]), O.push(y[++A]);
    return new n(O);
  }
  t._ = s;
  const i = new n("+");
  function c(y, ...j) {
    const O = [E(y[0])];
    let A = 0;
    for (; A < j.length; )
      O.push(i), a(O, j[A]), O.push(i, E(y[++A]));
    return u(O), new n(O);
  }
  t.str = c;
  function a(y, j) {
    j instanceof n ? y.push(...j._items) : j instanceof r ? y.push(j) : y.push(g(j));
  }
  t.addCodeArg = a;
  function u(y) {
    let j = 1;
    for (; j < y.length - 1; ) {
      if (y[j] === i) {
        const O = d(y[j - 1], y[j + 1]);
        if (O !== void 0) {
          y.splice(j - 1, 3, O);
          continue;
        }
        y[j++] = "+";
      }
      j++;
    }
  }
  function d(y, j) {
    if (j === '""')
      return y;
    if (y === '""')
      return j;
    if (typeof y == "string")
      return j instanceof r || y[y.length - 1] !== '"' ? void 0 : typeof j != "string" ? `${y.slice(0, -1)}${j}"` : j[0] === '"' ? y.slice(0, -1) + j.slice(1) : void 0;
    if (typeof j == "string" && j[0] === '"' && !(y instanceof r))
      return `"${y}${j.slice(1)}`;
  }
  function f(y, j) {
    return j.emptyStr() ? y : y.emptyStr() ? j : c`${y}${j}`;
  }
  t.strConcat = f;
  function g(y) {
    return typeof y == "number" || typeof y == "boolean" || y === null ? y : E(Array.isArray(y) ? y.join(",") : y);
  }
  function R(y) {
    return new n(E(y));
  }
  t.stringify = R;
  function E(y) {
    return JSON.stringify(y).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  t.safeStringify = E;
  function _(y) {
    return typeof y == "string" && t.IDENTIFIER.test(y) ? new n(`.${y}`) : s`[${y}]`;
  }
  t.getProperty = _;
  function w(y) {
    if (typeof y == "string" && t.IDENTIFIER.test(y))
      return new n(`${y}`);
    throw new Error(`CodeGen: invalid export name: ${y}, use explicit $id name mapping`);
  }
  t.getEsmExportName = w;
  function $(y) {
    return new n(y.toString());
  }
  t.regexpCode = $;
})(Vt);
var Pr = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.ValueScope = t.ValueScopeName = t.Scope = t.varKinds = t.UsedValueState = void 0;
  const e = Vt;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(u) {
    u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
  })(n = t.UsedValueState || (t.UsedValueState = {})), t.varKinds = {
    const: new e.Name("const"),
    let: new e.Name("let"),
    var: new e.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: f } = {}) {
      this._names = {}, this._prefixes = d, this._parent = f;
    }
    toName(d) {
      return d instanceof e.Name ? d : this.name(d);
    }
    name(d) {
      return new e.Name(this._newName(d));
    }
    _newName(d) {
      const f = this._names[d] || this._nameGroup(d);
      return `${d}${f.index++}`;
    }
    _nameGroup(d) {
      var f, g;
      if (!((g = (f = this._parent) === null || f === void 0 ? void 0 : f._prefixes) === null || g === void 0) && g.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  t.Scope = s;
  class i extends e.Name {
    constructor(d, f) {
      super(f), this.prefix = d;
    }
    setValue(d, { property: f, itemIndex: g }) {
      this.value = d, this.scopePath = (0, e._)`.${new e.Name(f)}[${g}]`;
    }
  }
  t.ValueScopeName = i;
  const c = (0, e._)`\n`;
  class a extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? c : e.nil };
    }
    get() {
      return this._scope;
    }
    name(d) {
      return new i(d, this._newName(d));
    }
    value(d, f) {
      var g;
      if (f.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const R = this.toName(d), { prefix: E } = R, _ = (g = f.key) !== null && g !== void 0 ? g : f.ref;
      let w = this._values[E];
      if (w) {
        const j = w.get(_);
        if (j)
          return j;
      } else
        w = this._values[E] = /* @__PURE__ */ new Map();
      w.set(_, R);
      const $ = this._scope[E] || (this._scope[E] = []), y = $.length;
      return $[y] = f.ref, R.setValue(f, { property: E, itemIndex: y }), R;
    }
    getValue(d, f) {
      const g = this._values[d];
      if (g)
        return g.get(f);
    }
    scopeRefs(d, f = this._values) {
      return this._reduceValues(f, (g) => {
        if (g.scopePath === void 0)
          throw new Error(`CodeGen: name "${g}" has no value`);
        return (0, e._)`${d}${g.scopePath}`;
      });
    }
    scopeCode(d = this._values, f, g) {
      return this._reduceValues(d, (R) => {
        if (R.value === void 0)
          throw new Error(`CodeGen: name "${R}" has no value`);
        return R.value.code;
      }, f, g);
    }
    _reduceValues(d, f, g = {}, R) {
      let E = e.nil;
      for (const _ in d) {
        const w = d[_];
        if (!w)
          continue;
        const $ = g[_] = g[_] || /* @__PURE__ */ new Map();
        w.forEach((y) => {
          if ($.has(y))
            return;
          $.set(y, n.Started);
          let j = f(y);
          if (j) {
            const O = this.opts.es5 ? t.varKinds.var : t.varKinds.const;
            E = (0, e._)`${E}${O} ${y} = ${j};${this.opts._n}`;
          } else if (j = R?.(y))
            E = (0, e._)`${E}${j}${this.opts._n}`;
          else
            throw new r(y);
          $.set(y, n.Completed);
        });
      }
      return E;
    }
  }
  t.ValueScope = a;
})(Pr);
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.or = t.and = t.not = t.CodeGen = t.operators = t.varKinds = t.ValueScopeName = t.ValueScope = t.Scope = t.Name = t.regexpCode = t.stringify = t.getProperty = t.nil = t.strConcat = t.str = t._ = void 0;
  const e = Vt, r = Pr;
  var n = Vt;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(t, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(t, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(t, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = Pr;
  Object.defineProperty(t, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(t, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(t, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(t, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), t.operators = {
    GT: new e._Code(">"),
    GTE: new e._Code(">="),
    LT: new e._Code("<"),
    LTE: new e._Code("<="),
    EQ: new e._Code("==="),
    NEQ: new e._Code("!=="),
    NOT: new e._Code("!"),
    OR: new e._Code("||"),
    AND: new e._Code("&&"),
    ADD: new e._Code("+")
  };
  class i {
    optimizeNodes() {
      return this;
    }
    optimizeNames(o, h) {
      return this;
    }
  }
  class c extends i {
    constructor(o, h, I) {
      super(), this.varKind = o, this.name = h, this.rhs = I;
    }
    render({ es5: o, _n: h }) {
      const I = o ? r.varKinds.var : this.varKind, V = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${I} ${this.name}${V};` + h;
    }
    optimizeNames(o, h) {
      if (o[this.name.str])
        return this.rhs && (this.rhs = se(this.rhs, o, h)), this;
    }
    get names() {
      return this.rhs instanceof e._CodeOrName ? this.rhs.names : {};
    }
  }
  class a extends i {
    constructor(o, h, I) {
      super(), this.lhs = o, this.rhs = h, this.sideEffects = I;
    }
    render({ _n: o }) {
      return `${this.lhs} = ${this.rhs};` + o;
    }
    optimizeNames(o, h) {
      if (!(this.lhs instanceof e.Name && !o[this.lhs.str] && !this.sideEffects))
        return this.rhs = se(this.rhs, o, h), this;
    }
    get names() {
      const o = this.lhs instanceof e.Name ? {} : { ...this.lhs.names };
      return ae(o, this.rhs);
    }
  }
  class u extends a {
    constructor(o, h, I, V) {
      super(o, I, V), this.op = h;
    }
    render({ _n: o }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + o;
    }
  }
  class d extends i {
    constructor(o) {
      super(), this.label = o, this.names = {};
    }
    render({ _n: o }) {
      return `${this.label}:` + o;
    }
  }
  class f extends i {
    constructor(o) {
      super(), this.label = o, this.names = {};
    }
    render({ _n: o }) {
      return `break${this.label ? ` ${this.label}` : ""};` + o;
    }
  }
  class g extends i {
    constructor(o) {
      super(), this.error = o;
    }
    render({ _n: o }) {
      return `throw ${this.error};` + o;
    }
    get names() {
      return this.error.names;
    }
  }
  class R extends i {
    constructor(o) {
      super(), this.code = o;
    }
    render({ _n: o }) {
      return `${this.code};` + o;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(o, h) {
      return this.code = se(this.code, o, h), this;
    }
    get names() {
      return this.code instanceof e._CodeOrName ? this.code.names : {};
    }
  }
  class E extends i {
    constructor(o = []) {
      super(), this.nodes = o;
    }
    render(o) {
      return this.nodes.reduce((h, I) => h + I.render(o), "");
    }
    optimizeNodes() {
      const { nodes: o } = this;
      let h = o.length;
      for (; h--; ) {
        const I = o[h].optimizeNodes();
        Array.isArray(I) ? o.splice(h, 1, ...I) : I ? o[h] = I : o.splice(h, 1);
      }
      return o.length > 0 ? this : void 0;
    }
    optimizeNames(o, h) {
      const { nodes: I } = this;
      let V = I.length;
      for (; V--; ) {
        const z = I[V];
        z.optimizeNames(o, h) || (Ie(o, z.names), I.splice(V, 1));
      }
      return I.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((o, h) => x(o, h.names), {});
    }
  }
  class _ extends E {
    render(o) {
      return "{" + o._n + super.render(o) + "}" + o._n;
    }
  }
  class w extends E {
  }
  class $ extends _ {
  }
  $.kind = "else";
  class y extends _ {
    constructor(o, h) {
      super(h), this.condition = o;
    }
    render(o) {
      let h = `if(${this.condition})` + super.render(o);
      return this.else && (h += "else " + this.else.render(o)), h;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const o = this.condition;
      if (o === !0)
        return this.nodes;
      let h = this.else;
      if (h) {
        const I = h.optimizeNodes();
        h = this.else = Array.isArray(I) ? new $(I) : I;
      }
      if (h)
        return o === !1 ? h instanceof y ? h : h.nodes : this.nodes.length ? this : new y(Ve(o), h instanceof y ? [h] : h.nodes);
      if (!(o === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(o, h) {
      var I;
      if (this.else = (I = this.else) === null || I === void 0 ? void 0 : I.optimizeNames(o, h), !!(super.optimizeNames(o, h) || this.else))
        return this.condition = se(this.condition, o, h), this;
    }
    get names() {
      const o = super.names;
      return ae(o, this.condition), this.else && x(o, this.else.names), o;
    }
  }
  y.kind = "if";
  class j extends _ {
  }
  j.kind = "for";
  class O extends j {
    constructor(o) {
      super(), this.iteration = o;
    }
    render(o) {
      return `for(${this.iteration})` + super.render(o);
    }
    optimizeNames(o, h) {
      if (super.optimizeNames(o, h))
        return this.iteration = se(this.iteration, o, h), this;
    }
    get names() {
      return x(super.names, this.iteration.names);
    }
  }
  class A extends j {
    constructor(o, h, I, V) {
      super(), this.varKind = o, this.name = h, this.from = I, this.to = V;
    }
    render(o) {
      const h = o.es5 ? r.varKinds.var : this.varKind, { name: I, from: V, to: z } = this;
      return `for(${h} ${I}=${V}; ${I}<${z}; ${I}++)` + super.render(o);
    }
    get names() {
      const o = ae(super.names, this.from);
      return ae(o, this.to);
    }
  }
  class q extends j {
    constructor(o, h, I, V) {
      super(), this.loop = o, this.varKind = h, this.name = I, this.iterable = V;
    }
    render(o) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(o);
    }
    optimizeNames(o, h) {
      if (super.optimizeNames(o, h))
        return this.iterable = se(this.iterable, o, h), this;
    }
    get names() {
      return x(super.names, this.iterable.names);
    }
  }
  class S extends _ {
    constructor(o, h, I) {
      super(), this.name = o, this.args = h, this.async = I;
    }
    render(o) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(o);
    }
  }
  S.kind = "func";
  class k extends E {
    render(o) {
      return "return " + super.render(o);
    }
  }
  k.kind = "return";
  class M extends _ {
    render(o) {
      let h = "try" + super.render(o);
      return this.catch && (h += this.catch.render(o)), this.finally && (h += this.finally.render(o)), h;
    }
    optimizeNodes() {
      var o, h;
      return super.optimizeNodes(), (o = this.catch) === null || o === void 0 || o.optimizeNodes(), (h = this.finally) === null || h === void 0 || h.optimizeNodes(), this;
    }
    optimizeNames(o, h) {
      var I, V;
      return super.optimizeNames(o, h), (I = this.catch) === null || I === void 0 || I.optimizeNames(o, h), (V = this.finally) === null || V === void 0 || V.optimizeNames(o, h), this;
    }
    get names() {
      const o = super.names;
      return this.catch && x(o, this.catch.names), this.finally && x(o, this.finally.names), o;
    }
  }
  class G extends _ {
    constructor(o) {
      super(), this.error = o;
    }
    render(o) {
      return `catch(${this.error})` + super.render(o);
    }
  }
  G.kind = "catch";
  class Y extends _ {
    render(o) {
      return "finally" + super.render(o);
    }
  }
  Y.kind = "finally";
  class oe {
    constructor(o, h = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...h, _n: h.lines ? `
` : "" }, this._extScope = o, this._scope = new r.Scope({ parent: o }), this._nodes = [new w()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(o) {
      return this._scope.name(o);
    }
    // reserves unique name in the external scope
    scopeName(o) {
      return this._extScope.name(o);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(o, h) {
      const I = this._extScope.value(o, h);
      return (this._values[I.prefix] || (this._values[I.prefix] = /* @__PURE__ */ new Set())).add(I), I;
    }
    getScopeValue(o, h) {
      return this._extScope.getValue(o, h);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(o) {
      return this._extScope.scopeRefs(o, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(o, h, I, V) {
      const z = this._scope.toName(h);
      return I !== void 0 && V && (this._constants[z.str] = I), this._leafNode(new c(o, z, I)), z;
    }
    // `const` declaration (`var` in es5 mode)
    const(o, h, I) {
      return this._def(r.varKinds.const, o, h, I);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(o, h, I) {
      return this._def(r.varKinds.let, o, h, I);
    }
    // `var` declaration with optional assignment
    var(o, h, I) {
      return this._def(r.varKinds.var, o, h, I);
    }
    // assignment code
    assign(o, h, I) {
      return this._leafNode(new a(o, h, I));
    }
    // `+=` code
    add(o, h) {
      return this._leafNode(new u(o, t.operators.ADD, h));
    }
    // appends passed SafeExpr to code or executes Block
    code(o) {
      return typeof o == "function" ? o() : o !== e.nil && this._leafNode(new R(o)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...o) {
      const h = ["{"];
      for (const [I, V] of o)
        h.length > 1 && h.push(","), h.push(I), (I !== V || this.opts.es5) && (h.push(":"), (0, e.addCodeArg)(h, V));
      return h.push("}"), new e._Code(h);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(o, h, I) {
      if (this._blockNode(new y(o)), h && I)
        this.code(h).else().code(I).endIf();
      else if (h)
        this.code(h).endIf();
      else if (I)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(o) {
      return this._elseNode(new y(o));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new $());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(y, $);
    }
    _for(o, h) {
      return this._blockNode(o), h && this.code(h).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(o, h) {
      return this._for(new O(o), h);
    }
    // `for` statement for a range of values
    forRange(o, h, I, V, z = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const Z = this._scope.toName(o);
      return this._for(new A(z, Z, h, I), () => V(Z));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(o, h, I, V = r.varKinds.const) {
      const z = this._scope.toName(o);
      if (this.opts.es5) {
        const Z = h instanceof e.Name ? h : this.var("_arr", h);
        return this.forRange("_i", 0, (0, e._)`${Z}.length`, (Q) => {
          this.var(z, (0, e._)`${Z}[${Q}]`), I(z);
        });
      }
      return this._for(new q("of", V, z, h), () => I(z));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(o, h, I, V = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(o, (0, e._)`Object.keys(${h})`, I);
      const z = this._scope.toName(o);
      return this._for(new q("in", V, z, h), () => I(z));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(j);
    }
    // `label` statement
    label(o) {
      return this._leafNode(new d(o));
    }
    // `break` statement
    break(o) {
      return this._leafNode(new f(o));
    }
    // `return` statement
    return(o) {
      const h = new k();
      if (this._blockNode(h), this.code(o), h.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(k);
    }
    // `try` statement
    try(o, h, I) {
      if (!h && !I)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const V = new M();
      if (this._blockNode(V), this.code(o), h) {
        const z = this.name("e");
        this._currNode = V.catch = new G(z), h(z);
      }
      return I && (this._currNode = V.finally = new Y(), this.code(I)), this._endBlockNode(G, Y);
    }
    // `throw` statement
    throw(o) {
      return this._leafNode(new g(o));
    }
    // start self-balancing block
    block(o, h) {
      return this._blockStarts.push(this._nodes.length), o && this.code(o).endBlock(h), this;
    }
    // end the current self-balancing block
    endBlock(o) {
      const h = this._blockStarts.pop();
      if (h === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const I = this._nodes.length - h;
      if (I < 0 || o !== void 0 && I !== o)
        throw new Error(`CodeGen: wrong number of nodes: ${I} vs ${o} expected`);
      return this._nodes.length = h, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(o, h = e.nil, I, V) {
      return this._blockNode(new S(o, h, I)), V && this.code(V).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(S);
    }
    optimize(o = 1) {
      for (; o-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(o) {
      return this._currNode.nodes.push(o), this;
    }
    _blockNode(o) {
      this._currNode.nodes.push(o), this._nodes.push(o);
    }
    _endBlockNode(o, h) {
      const I = this._currNode;
      if (I instanceof o || h && I instanceof h)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${h ? `${o.kind}/${h.kind}` : o.kind}"`);
    }
    _elseNode(o) {
      const h = this._currNode;
      if (!(h instanceof y))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = h.else = o, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const o = this._nodes;
      return o[o.length - 1];
    }
    set _currNode(o) {
      const h = this._nodes;
      h[h.length - 1] = o;
    }
  }
  t.CodeGen = oe;
  function x(T, o) {
    for (const h in o)
      T[h] = (T[h] || 0) + (o[h] || 0);
    return T;
  }
  function ae(T, o) {
    return o instanceof e._CodeOrName ? x(T, o.names) : T;
  }
  function se(T, o, h) {
    if (T instanceof e.Name)
      return I(T);
    if (!V(T))
      return T;
    return new e._Code(T._items.reduce((z, Z) => (Z instanceof e.Name && (Z = I(Z)), Z instanceof e._Code ? z.push(...Z._items) : z.push(Z), z), []));
    function I(z) {
      const Z = h[z.str];
      return Z === void 0 || o[z.str] !== 1 ? z : (delete o[z.str], Z);
    }
    function V(z) {
      return z instanceof e._Code && z._items.some((Z) => Z instanceof e.Name && o[Z.str] === 1 && h[Z.str] !== void 0);
    }
  }
  function Ie(T, o) {
    for (const h in o)
      T[h] = (T[h] || 0) - (o[h] || 0);
  }
  function Ve(T) {
    return typeof T == "boolean" || typeof T == "number" || T === null ? !T : (0, e._)`!${F(T)}`;
  }
  t.not = Ve;
  const Be = b(t.operators.AND);
  function st(...T) {
    return T.reduce(Be);
  }
  t.and = st;
  const Qe = b(t.operators.OR);
  function L(...T) {
    return T.reduce(Qe);
  }
  t.or = L;
  function b(T) {
    return (o, h) => o === e.nil ? h : h === e.nil ? o : (0, e._)`${F(o)} ${T} ${F(h)}`;
  }
  function F(T) {
    return T instanceof e.Name ? T : (0, e._)`(${T})`;
  }
})(ee);
var ne = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.checkStrictMode = t.getErrorPath = t.Type = t.useFunc = t.setEvaluated = t.evaluatedPropsToName = t.mergeEvaluated = t.eachItem = t.unescapeJsonPointer = t.escapeJsonPointer = t.escapeFragment = t.unescapeFragment = t.schemaRefOrVal = t.schemaHasRulesButRef = t.schemaHasRules = t.checkUnknownRules = t.alwaysValidSchema = t.toHash = void 0;
  const e = ee, r = Vt;
  function n(S) {
    const k = {};
    for (const M of S)
      k[M] = !0;
    return k;
  }
  t.toHash = n;
  function s(S, k) {
    return typeof k == "boolean" ? k : Object.keys(k).length === 0 ? !0 : (i(S, k), !c(k, S.self.RULES.all));
  }
  t.alwaysValidSchema = s;
  function i(S, k = S.schema) {
    const { opts: M, self: G } = S;
    if (!M.strictSchema || typeof k == "boolean")
      return;
    const Y = G.RULES.keywords;
    for (const oe in k)
      Y[oe] || q(S, `unknown keyword: "${oe}"`);
  }
  t.checkUnknownRules = i;
  function c(S, k) {
    if (typeof S == "boolean")
      return !S;
    for (const M in S)
      if (k[M])
        return !0;
    return !1;
  }
  t.schemaHasRules = c;
  function a(S, k) {
    if (typeof S == "boolean")
      return !S;
    for (const M in S)
      if (M !== "$ref" && k.all[M])
        return !0;
    return !1;
  }
  t.schemaHasRulesButRef = a;
  function u({ topSchemaRef: S, schemaPath: k }, M, G, Y) {
    if (!Y) {
      if (typeof M == "number" || typeof M == "boolean")
        return M;
      if (typeof M == "string")
        return (0, e._)`${M}`;
    }
    return (0, e._)`${S}${k}${(0, e.getProperty)(G)}`;
  }
  t.schemaRefOrVal = u;
  function d(S) {
    return R(decodeURIComponent(S));
  }
  t.unescapeFragment = d;
  function f(S) {
    return encodeURIComponent(g(S));
  }
  t.escapeFragment = f;
  function g(S) {
    return typeof S == "number" ? `${S}` : S.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  t.escapeJsonPointer = g;
  function R(S) {
    return S.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  t.unescapeJsonPointer = R;
  function E(S, k) {
    if (Array.isArray(S))
      for (const M of S)
        k(M);
    else
      k(S);
  }
  t.eachItem = E;
  function _({ mergeNames: S, mergeToName: k, mergeValues: M, resultToName: G }) {
    return (Y, oe, x, ae) => {
      const se = x === void 0 ? oe : x instanceof e.Name ? (oe instanceof e.Name ? S(Y, oe, x) : k(Y, oe, x), x) : oe instanceof e.Name ? (k(Y, x, oe), oe) : M(oe, x);
      return ae === e.Name && !(se instanceof e.Name) ? G(Y, se) : se;
    };
  }
  t.mergeEvaluated = {
    props: _({
      mergeNames: (S, k, M) => S.if((0, e._)`${M} !== true && ${k} !== undefined`, () => {
        S.if((0, e._)`${k} === true`, () => S.assign(M, !0), () => S.assign(M, (0, e._)`${M} || {}`).code((0, e._)`Object.assign(${M}, ${k})`));
      }),
      mergeToName: (S, k, M) => S.if((0, e._)`${M} !== true`, () => {
        k === !0 ? S.assign(M, !0) : (S.assign(M, (0, e._)`${M} || {}`), $(S, M, k));
      }),
      mergeValues: (S, k) => S === !0 ? !0 : { ...S, ...k },
      resultToName: w
    }),
    items: _({
      mergeNames: (S, k, M) => S.if((0, e._)`${M} !== true && ${k} !== undefined`, () => S.assign(M, (0, e._)`${k} === true ? true : ${M} > ${k} ? ${M} : ${k}`)),
      mergeToName: (S, k, M) => S.if((0, e._)`${M} !== true`, () => S.assign(M, k === !0 ? !0 : (0, e._)`${M} > ${k} ? ${M} : ${k}`)),
      mergeValues: (S, k) => S === !0 ? !0 : Math.max(S, k),
      resultToName: (S, k) => S.var("items", k)
    })
  };
  function w(S, k) {
    if (k === !0)
      return S.var("props", !0);
    const M = S.var("props", (0, e._)`{}`);
    return k !== void 0 && $(S, M, k), M;
  }
  t.evaluatedPropsToName = w;
  function $(S, k, M) {
    Object.keys(M).forEach((G) => S.assign((0, e._)`${k}${(0, e.getProperty)(G)}`, !0));
  }
  t.setEvaluated = $;
  const y = {};
  function j(S, k) {
    return S.scopeValue("func", {
      ref: k,
      code: y[k.code] || (y[k.code] = new r._Code(k.code))
    });
  }
  t.useFunc = j;
  var O;
  (function(S) {
    S[S.Num = 0] = "Num", S[S.Str = 1] = "Str";
  })(O = t.Type || (t.Type = {}));
  function A(S, k, M) {
    if (S instanceof e.Name) {
      const G = k === O.Num;
      return M ? G ? (0, e._)`"[" + ${S} + "]"` : (0, e._)`"['" + ${S} + "']"` : G ? (0, e._)`"/" + ${S}` : (0, e._)`"/" + ${S}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return M ? (0, e.getProperty)(S).toString() : "/" + g(S);
  }
  t.getErrorPath = A;
  function q(S, k, M = S.opts.strictSchema) {
    if (M) {
      if (k = `strict mode: ${k}`, M === !0)
        throw new Error(k);
      S.self.logger.warn(k);
    }
  }
  t.checkStrictMode = q;
})(ne);
var Ge = {};
Object.defineProperty(Ge, "__esModule", { value: !0 });
const Se = ee, ho = {
  // validation function arguments
  data: new Se.Name("data"),
  // args passed from referencing schema
  valCxt: new Se.Name("valCxt"),
  instancePath: new Se.Name("instancePath"),
  parentData: new Se.Name("parentData"),
  parentDataProperty: new Se.Name("parentDataProperty"),
  rootData: new Se.Name("rootData"),
  dynamicAnchors: new Se.Name("dynamicAnchors"),
  // function scoped variables
  vErrors: new Se.Name("vErrors"),
  errors: new Se.Name("errors"),
  this: new Se.Name("this"),
  // "globals"
  self: new Se.Name("self"),
  scope: new Se.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Se.Name("json"),
  jsonPos: new Se.Name("jsonPos"),
  jsonLen: new Se.Name("jsonLen"),
  jsonPart: new Se.Name("jsonPart")
};
Ge.default = ho;
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.extendErrors = t.resetErrorsCount = t.reportExtraError = t.reportError = t.keyword$DataError = t.keywordError = void 0;
  const e = ee, r = ne, n = Ge;
  t.keywordError = {
    message: ({ keyword: $ }) => (0, e.str)`must pass "${$}" keyword validation`
  }, t.keyword$DataError = {
    message: ({ keyword: $, schemaType: y }) => y ? (0, e.str)`"${$}" keyword must be ${y} ($data)` : (0, e.str)`"${$}" keyword is invalid ($data)`
  };
  function s($, y = t.keywordError, j, O) {
    const { it: A } = $, { gen: q, compositeRule: S, allErrors: k } = A, M = g($, y, j);
    O ?? (S || k) ? u(q, M) : d(A, (0, e._)`[${M}]`);
  }
  t.reportError = s;
  function i($, y = t.keywordError, j) {
    const { it: O } = $, { gen: A, compositeRule: q, allErrors: S } = O, k = g($, y, j);
    u(A, k), q || S || d(O, n.default.vErrors);
  }
  t.reportExtraError = i;
  function c($, y) {
    $.assign(n.default.errors, y), $.if((0, e._)`${n.default.vErrors} !== null`, () => $.if(y, () => $.assign((0, e._)`${n.default.vErrors}.length`, y), () => $.assign(n.default.vErrors, null)));
  }
  t.resetErrorsCount = c;
  function a({ gen: $, keyword: y, schemaValue: j, data: O, errsCount: A, it: q }) {
    if (A === void 0)
      throw new Error("ajv implementation error");
    const S = $.name("err");
    $.forRange("i", A, n.default.errors, (k) => {
      $.const(S, (0, e._)`${n.default.vErrors}[${k}]`), $.if((0, e._)`${S}.instancePath === undefined`, () => $.assign((0, e._)`${S}.instancePath`, (0, e.strConcat)(n.default.instancePath, q.errorPath))), $.assign((0, e._)`${S}.schemaPath`, (0, e.str)`${q.errSchemaPath}/${y}`), q.opts.verbose && ($.assign((0, e._)`${S}.schema`, j), $.assign((0, e._)`${S}.data`, O));
    });
  }
  t.extendErrors = a;
  function u($, y) {
    const j = $.const("err", y);
    $.if((0, e._)`${n.default.vErrors} === null`, () => $.assign(n.default.vErrors, (0, e._)`[${j}]`), (0, e._)`${n.default.vErrors}.push(${j})`), $.code((0, e._)`${n.default.errors}++`);
  }
  function d($, y) {
    const { gen: j, validateName: O, schemaEnv: A } = $;
    A.$async ? j.throw((0, e._)`new ${$.ValidationError}(${y})`) : (j.assign((0, e._)`${O}.errors`, y), j.return(!1));
  }
  const f = {
    keyword: new e.Name("keyword"),
    schemaPath: new e.Name("schemaPath"),
    params: new e.Name("params"),
    propertyName: new e.Name("propertyName"),
    message: new e.Name("message"),
    schema: new e.Name("schema"),
    parentSchema: new e.Name("parentSchema")
  };
  function g($, y, j) {
    const { createErrors: O } = $.it;
    return O === !1 ? (0, e._)`{}` : R($, y, j);
  }
  function R($, y, j = {}) {
    const { gen: O, it: A } = $, q = [
      E(A, j),
      _($, j)
    ];
    return w($, y, q), O.object(...q);
  }
  function E({ errorPath: $ }, { instancePath: y }) {
    const j = y ? (0, e.str)`${$}${(0, r.getErrorPath)(y, r.Type.Str)}` : $;
    return [n.default.instancePath, (0, e.strConcat)(n.default.instancePath, j)];
  }
  function _({ keyword: $, it: { errSchemaPath: y } }, { schemaPath: j, parentSchema: O }) {
    let A = O ? y : (0, e.str)`${y}/${$}`;
    return j && (A = (0, e.str)`${A}${(0, r.getErrorPath)(j, r.Type.Str)}`), [f.schemaPath, A];
  }
  function w($, { params: y, message: j }, O) {
    const { keyword: A, data: q, schemaValue: S, it: k } = $, { opts: M, propertyName: G, topSchemaRef: Y, schemaPath: oe } = k;
    O.push([f.keyword, A], [f.params, typeof y == "function" ? y($) : y || (0, e._)`{}`]), M.messages && O.push([f.message, typeof j == "function" ? j($) : j]), M.verbose && O.push([f.schema, S], [f.parentSchema, (0, e._)`${Y}${oe}`], [n.default.data, q]), G && O.push([f.propertyName, G]);
  }
})(Ht);
var Bn;
function mo() {
  if (Bn)
    return lt;
  Bn = 1, Object.defineProperty(lt, "__esModule", { value: !0 }), lt.boolOrEmptySchema = lt.topBoolOrEmptySchema = void 0;
  const t = Ht, e = ee, r = Ge, n = {
    message: "boolean schema is false"
  };
  function s(a) {
    const { gen: u, schema: d, validateName: f } = a;
    d === !1 ? c(a, !1) : typeof d == "object" && d.$async === !0 ? u.return(r.default.data) : (u.assign((0, e._)`${f}.errors`, null), u.return(!0));
  }
  lt.topBoolOrEmptySchema = s;
  function i(a, u) {
    const { gen: d, schema: f } = a;
    f === !1 ? (d.var(u, !1), c(a)) : d.var(u, !0);
  }
  lt.boolOrEmptySchema = i;
  function c(a, u) {
    const { gen: d, data: f } = a, g = {
      gen: d,
      keyword: "false schema",
      data: f,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: a
    };
    (0, t.reportError)(g, n, void 0, u);
  }
  return lt;
}
var zt = {}, pt = {};
Object.defineProperty(pt, "__esModule", { value: !0 });
pt.getRules = pt.isJSONType = void 0;
const yo = ["string", "number", "integer", "boolean", "null", "object", "array"], go = new Set(yo);
function vo(t) {
  return typeof t == "string" && go.has(t);
}
pt.isJSONType = vo;
function $o() {
  const t = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...t, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, t.number, t.string, t.array, t.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
pt.getRules = $o;
var xe = {}, Jn;
function Ns() {
  if (Jn)
    return xe;
  Jn = 1, Object.defineProperty(xe, "__esModule", { value: !0 }), xe.shouldUseRule = xe.shouldUseGroup = xe.schemaHasRulesForType = void 0;
  function t({ schema: n, self: s }, i) {
    const c = s.RULES.types[i];
    return c && c !== !0 && e(n, c);
  }
  xe.schemaHasRulesForType = t;
  function e(n, s) {
    return s.rules.some((i) => r(n, i));
  }
  xe.shouldUseGroup = e;
  function r(n, s) {
    var i;
    return n[s.keyword] !== void 0 || ((i = s.definition.implements) === null || i === void 0 ? void 0 : i.some((c) => n[c] !== void 0));
  }
  return xe.shouldUseRule = r, xe;
}
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.reportTypeError = t.checkDataTypes = t.checkDataType = t.coerceAndCheckDataType = t.getJSONTypes = t.getSchemaTypes = t.DataType = void 0;
  const e = pt, r = Ns(), n = Ht, s = ee, i = ne;
  var c;
  (function(O) {
    O[O.Correct = 0] = "Correct", O[O.Wrong = 1] = "Wrong";
  })(c = t.DataType || (t.DataType = {}));
  function a(O) {
    const A = u(O.type);
    if (A.includes("null")) {
      if (O.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!A.length && O.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      O.nullable === !0 && A.push("null");
    }
    return A;
  }
  t.getSchemaTypes = a;
  function u(O) {
    const A = Array.isArray(O) ? O : O ? [O] : [];
    if (A.every(e.isJSONType))
      return A;
    throw new Error("type must be JSONType or JSONType[]: " + A.join(","));
  }
  t.getJSONTypes = u;
  function d(O, A) {
    const { gen: q, data: S, opts: k } = O, M = g(A, k.coerceTypes), G = A.length > 0 && !(M.length === 0 && A.length === 1 && (0, r.schemaHasRulesForType)(O, A[0]));
    if (G) {
      const Y = w(A, S, k.strictNumbers, c.Wrong);
      q.if(Y, () => {
        M.length ? R(O, A, M) : y(O);
      });
    }
    return G;
  }
  t.coerceAndCheckDataType = d;
  const f = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function g(O, A) {
    return A ? O.filter((q) => f.has(q) || A === "array" && q === "array") : [];
  }
  function R(O, A, q) {
    const { gen: S, data: k, opts: M } = O, G = S.let("dataType", (0, s._)`typeof ${k}`), Y = S.let("coerced", (0, s._)`undefined`);
    M.coerceTypes === "array" && S.if((0, s._)`${G} == 'object' && Array.isArray(${k}) && ${k}.length == 1`, () => S.assign(k, (0, s._)`${k}[0]`).assign(G, (0, s._)`typeof ${k}`).if(w(A, k, M.strictNumbers), () => S.assign(Y, k))), S.if((0, s._)`${Y} !== undefined`);
    for (const x of q)
      (f.has(x) || x === "array" && M.coerceTypes === "array") && oe(x);
    S.else(), y(O), S.endIf(), S.if((0, s._)`${Y} !== undefined`, () => {
      S.assign(k, Y), E(O, Y);
    });
    function oe(x) {
      switch (x) {
        case "string":
          S.elseIf((0, s._)`${G} == "number" || ${G} == "boolean"`).assign(Y, (0, s._)`"" + ${k}`).elseIf((0, s._)`${k} === null`).assign(Y, (0, s._)`""`);
          return;
        case "number":
          S.elseIf((0, s._)`${G} == "boolean" || ${k} === null
              || (${G} == "string" && ${k} && ${k} == +${k})`).assign(Y, (0, s._)`+${k}`);
          return;
        case "integer":
          S.elseIf((0, s._)`${G} === "boolean" || ${k} === null
              || (${G} === "string" && ${k} && ${k} == +${k} && !(${k} % 1))`).assign(Y, (0, s._)`+${k}`);
          return;
        case "boolean":
          S.elseIf((0, s._)`${k} === "false" || ${k} === 0 || ${k} === null`).assign(Y, !1).elseIf((0, s._)`${k} === "true" || ${k} === 1`).assign(Y, !0);
          return;
        case "null":
          S.elseIf((0, s._)`${k} === "" || ${k} === 0 || ${k} === false`), S.assign(Y, null);
          return;
        case "array":
          S.elseIf((0, s._)`${G} === "string" || ${G} === "number"
              || ${G} === "boolean" || ${k} === null`).assign(Y, (0, s._)`[${k}]`);
      }
    }
  }
  function E({ gen: O, parentData: A, parentDataProperty: q }, S) {
    O.if((0, s._)`${A} !== undefined`, () => O.assign((0, s._)`${A}[${q}]`, S));
  }
  function _(O, A, q, S = c.Correct) {
    const k = S === c.Correct ? s.operators.EQ : s.operators.NEQ;
    let M;
    switch (O) {
      case "null":
        return (0, s._)`${A} ${k} null`;
      case "array":
        M = (0, s._)`Array.isArray(${A})`;
        break;
      case "object":
        M = (0, s._)`${A} && typeof ${A} == "object" && !Array.isArray(${A})`;
        break;
      case "integer":
        M = G((0, s._)`!(${A} % 1) && !isNaN(${A})`);
        break;
      case "number":
        M = G();
        break;
      default:
        return (0, s._)`typeof ${A} ${k} ${O}`;
    }
    return S === c.Correct ? M : (0, s.not)(M);
    function G(Y = s.nil) {
      return (0, s.and)((0, s._)`typeof ${A} == "number"`, Y, q ? (0, s._)`isFinite(${A})` : s.nil);
    }
  }
  t.checkDataType = _;
  function w(O, A, q, S) {
    if (O.length === 1)
      return _(O[0], A, q, S);
    let k;
    const M = (0, i.toHash)(O);
    if (M.array && M.object) {
      const G = (0, s._)`typeof ${A} != "object"`;
      k = M.null ? G : (0, s._)`!${A} || ${G}`, delete M.null, delete M.array, delete M.object;
    } else
      k = s.nil;
    M.number && delete M.integer;
    for (const G in M)
      k = (0, s.and)(k, _(G, A, q, S));
    return k;
  }
  t.checkDataTypes = w;
  const $ = {
    message: ({ schema: O }) => `must be ${O}`,
    params: ({ schema: O, schemaValue: A }) => typeof O == "string" ? (0, s._)`{type: ${O}}` : (0, s._)`{type: ${A}}`
  };
  function y(O) {
    const A = j(O);
    (0, n.reportError)(A, $);
  }
  t.reportTypeError = y;
  function j(O) {
    const { gen: A, data: q, schema: S } = O, k = (0, i.schemaRefOrVal)(O, S, "type");
    return {
      gen: A,
      keyword: "type",
      data: q,
      schema: S.type,
      schemaCode: k,
      schemaValue: k,
      parentSchema: S,
      params: {},
      it: O
    };
  }
})(zt);
var It = {}, Yn;
function _o() {
  if (Yn)
    return It;
  Yn = 1, Object.defineProperty(It, "__esModule", { value: !0 }), It.assignDefaults = void 0;
  const t = ee, e = ne;
  function r(s, i) {
    const { properties: c, items: a } = s.schema;
    if (i === "object" && c)
      for (const u in c)
        n(s, u, c[u].default);
    else
      i === "array" && Array.isArray(a) && a.forEach((u, d) => n(s, d, u.default));
  }
  It.assignDefaults = r;
  function n(s, i, c) {
    const { gen: a, compositeRule: u, data: d, opts: f } = s;
    if (c === void 0)
      return;
    const g = (0, t._)`${d}${(0, t.getProperty)(i)}`;
    if (u) {
      (0, e.checkStrictMode)(s, `default is ignored for: ${g}`);
      return;
    }
    let R = (0, t._)`${g} === undefined`;
    f.useDefaults === "empty" && (R = (0, t._)`${R} || ${g} === null || ${g} === ""`), a.if(R, (0, t._)`${g} = ${(0, t.stringify)(c)}`);
  }
  return It;
}
var Ae = {}, X = {};
Object.defineProperty(X, "__esModule", { value: !0 });
X.validateUnion = X.validateArray = X.usePattern = X.callValidateCode = X.schemaProperties = X.allSchemaProperties = X.noPropertyInData = X.propertyInData = X.isOwnProperty = X.hasPropFunc = X.reportMissingProp = X.checkMissingProp = X.checkReportMissingProp = void 0;
const ue = ee, Mr = ne, tt = Ge, wo = ne;
function bo(t, e) {
  const { gen: r, data: n, it: s } = t;
  r.if(Ur(r, n, e, s.opts.ownProperties), () => {
    t.setParams({ missingProperty: (0, ue._)`${e}` }, !0), t.error();
  });
}
X.checkReportMissingProp = bo;
function Po({ gen: t, data: e, it: { opts: r } }, n, s) {
  return (0, ue.or)(...n.map((i) => (0, ue.and)(Ur(t, e, i, r.ownProperties), (0, ue._)`${s} = ${i}`)));
}
X.checkMissingProp = Po;
function Eo(t, e) {
  t.setParams({ missingProperty: e }, !0), t.error();
}
X.reportMissingProp = Eo;
function Os(t) {
  return t.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ue._)`Object.prototype.hasOwnProperty`
  });
}
X.hasPropFunc = Os;
function qr(t, e, r) {
  return (0, ue._)`${Os(t)}.call(${e}, ${r})`;
}
X.isOwnProperty = qr;
function So(t, e, r, n) {
  const s = (0, ue._)`${e}${(0, ue.getProperty)(r)} !== undefined`;
  return n ? (0, ue._)`${s} && ${qr(t, e, r)}` : s;
}
X.propertyInData = So;
function Ur(t, e, r, n) {
  const s = (0, ue._)`${e}${(0, ue.getProperty)(r)} === undefined`;
  return n ? (0, ue.or)(s, (0, ue.not)(qr(t, e, r))) : s;
}
X.noPropertyInData = Ur;
function Cs(t) {
  return t ? Object.keys(t).filter((e) => e !== "__proto__") : [];
}
X.allSchemaProperties = Cs;
function To(t, e) {
  return Cs(e).filter((r) => !(0, Mr.alwaysValidSchema)(t, e[r]));
}
X.schemaProperties = To;
function Ro({ schemaCode: t, data: e, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: i }, it: c }, a, u, d) {
  const f = d ? (0, ue._)`${t}, ${e}, ${n}${s}` : e, g = [
    [tt.default.instancePath, (0, ue.strConcat)(tt.default.instancePath, i)],
    [tt.default.parentData, c.parentData],
    [tt.default.parentDataProperty, c.parentDataProperty],
    [tt.default.rootData, tt.default.rootData]
  ];
  c.opts.dynamicRef && g.push([tt.default.dynamicAnchors, tt.default.dynamicAnchors]);
  const R = (0, ue._)`${f}, ${r.object(...g)}`;
  return u !== ue.nil ? (0, ue._)`${a}.call(${u}, ${R})` : (0, ue._)`${a}(${R})`;
}
X.callValidateCode = Ro;
const No = (0, ue._)`new RegExp`;
function Oo({ gen: t, it: { opts: e } }, r) {
  const n = e.unicodeRegExp ? "u" : "", { regExp: s } = e.code, i = s(r, n);
  return t.scopeValue("pattern", {
    key: i.toString(),
    ref: i,
    code: (0, ue._)`${s.code === "new RegExp" ? No : (0, wo.useFunc)(t, s)}(${r}, ${n})`
  });
}
X.usePattern = Oo;
function Co(t) {
  const { gen: e, data: r, keyword: n, it: s } = t, i = e.name("valid");
  if (s.allErrors) {
    const a = e.let("valid", !0);
    return c(() => e.assign(a, !1)), a;
  }
  return e.var(i, !0), c(() => e.break()), i;
  function c(a) {
    const u = e.const("len", (0, ue._)`${r}.length`);
    e.forRange("i", 0, u, (d) => {
      t.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: Mr.Type.Num
      }, i), e.if((0, ue.not)(i), a);
    });
  }
}
X.validateArray = Co;
function jo(t) {
  const { gen: e, schema: r, keyword: n, it: s } = t;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((u) => (0, Mr.alwaysValidSchema)(s, u)) && !s.opts.unevaluated)
    return;
  const c = e.let("valid", !1), a = e.name("_valid");
  e.block(() => r.forEach((u, d) => {
    const f = t.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, a);
    e.assign(c, (0, ue._)`${c} || ${a}`), t.mergeValidEvaluated(f, a) || e.if((0, ue.not)(c));
  })), t.result(c, () => t.reset(), () => t.error(!0));
}
X.validateUnion = jo;
var xn;
function ko() {
  if (xn)
    return Ae;
  xn = 1, Object.defineProperty(Ae, "__esModule", { value: !0 }), Ae.validateKeywordUsage = Ae.validSchemaType = Ae.funcKeywordCode = Ae.macroKeywordCode = void 0;
  const t = ee, e = Ge, r = X, n = Ht;
  function s(R, E) {
    const { gen: _, keyword: w, schema: $, parentSchema: y, it: j } = R, O = E.macro.call(j.self, $, y, j), A = d(_, w, O);
    j.opts.validateSchema !== !1 && j.self.validateSchema(O, !0);
    const q = _.name("valid");
    R.subschema({
      schema: O,
      schemaPath: t.nil,
      errSchemaPath: `${j.errSchemaPath}/${w}`,
      topSchemaRef: A,
      compositeRule: !0
    }, q), R.pass(q, () => R.error(!0));
  }
  Ae.macroKeywordCode = s;
  function i(R, E) {
    var _;
    const { gen: w, keyword: $, schema: y, parentSchema: j, $data: O, it: A } = R;
    u(A, E);
    const q = !O && E.compile ? E.compile.call(A.self, y, j, A) : E.validate, S = d(w, $, q), k = w.let("valid");
    R.block$data(k, M), R.ok((_ = E.valid) !== null && _ !== void 0 ? _ : k);
    function M() {
      if (E.errors === !1)
        oe(), E.modifying && c(R), x(() => R.error());
      else {
        const ae = E.async ? G() : Y();
        E.modifying && c(R), x(() => a(R, ae));
      }
    }
    function G() {
      const ae = w.let("ruleErrs", null);
      return w.try(() => oe((0, t._)`await `), (se) => w.assign(k, !1).if((0, t._)`${se} instanceof ${A.ValidationError}`, () => w.assign(ae, (0, t._)`${se}.errors`), () => w.throw(se))), ae;
    }
    function Y() {
      const ae = (0, t._)`${S}.errors`;
      return w.assign(ae, null), oe(t.nil), ae;
    }
    function oe(ae = E.async ? (0, t._)`await ` : t.nil) {
      const se = A.opts.passContext ? e.default.this : e.default.self, Ie = !("compile" in E && !O || E.schema === !1);
      w.assign(k, (0, t._)`${ae}${(0, r.callValidateCode)(R, S, se, Ie)}`, E.modifying);
    }
    function x(ae) {
      var se;
      w.if((0, t.not)((se = E.valid) !== null && se !== void 0 ? se : k), ae);
    }
  }
  Ae.funcKeywordCode = i;
  function c(R) {
    const { gen: E, data: _, it: w } = R;
    E.if(w.parentData, () => E.assign(_, (0, t._)`${w.parentData}[${w.parentDataProperty}]`));
  }
  function a(R, E) {
    const { gen: _ } = R;
    _.if((0, t._)`Array.isArray(${E})`, () => {
      _.assign(e.default.vErrors, (0, t._)`${e.default.vErrors} === null ? ${E} : ${e.default.vErrors}.concat(${E})`).assign(e.default.errors, (0, t._)`${e.default.vErrors}.length`), (0, n.extendErrors)(R);
    }, () => R.error());
  }
  function u({ schemaEnv: R }, E) {
    if (E.async && !R.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(R, E, _) {
    if (_ === void 0)
      throw new Error(`keyword "${E}" failed to compile`);
    return R.scopeValue("keyword", typeof _ == "function" ? { ref: _ } : { ref: _, code: (0, t.stringify)(_) });
  }
  function f(R, E, _ = !1) {
    return !E.length || E.some((w) => w === "array" ? Array.isArray(R) : w === "object" ? R && typeof R == "object" && !Array.isArray(R) : typeof R == w || _ && typeof R > "u");
  }
  Ae.validSchemaType = f;
  function g({ schema: R, opts: E, self: _, errSchemaPath: w }, $, y) {
    if (Array.isArray($.keyword) ? !$.keyword.includes(y) : $.keyword !== y)
      throw new Error("ajv implementation error");
    const j = $.dependencies;
    if (j?.some((O) => !Object.prototype.hasOwnProperty.call(R, O)))
      throw new Error(`parent schema must have dependencies of ${y}: ${j.join(",")}`);
    if ($.validateSchema && !$.validateSchema(R[y])) {
      const A = `keyword "${y}" value is invalid at path "${w}": ` + _.errorsText($.validateSchema.errors);
      if (E.validateSchema === "log")
        _.logger.error(A);
      else
        throw new Error(A);
    }
  }
  return Ae.validateKeywordUsage = g, Ae;
}
var Ze = {}, Zn;
function Io() {
  if (Zn)
    return Ze;
  Zn = 1, Object.defineProperty(Ze, "__esModule", { value: !0 }), Ze.extendSubschemaMode = Ze.extendSubschemaData = Ze.getSubschema = void 0;
  const t = ee, e = ne;
  function r(i, { keyword: c, schemaProp: a, schema: u, schemaPath: d, errSchemaPath: f, topSchemaRef: g }) {
    if (c !== void 0 && u !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (c !== void 0) {
      const R = i.schema[c];
      return a === void 0 ? {
        schema: R,
        schemaPath: (0, t._)`${i.schemaPath}${(0, t.getProperty)(c)}`,
        errSchemaPath: `${i.errSchemaPath}/${c}`
      } : {
        schema: R[a],
        schemaPath: (0, t._)`${i.schemaPath}${(0, t.getProperty)(c)}${(0, t.getProperty)(a)}`,
        errSchemaPath: `${i.errSchemaPath}/${c}/${(0, e.escapeFragment)(a)}`
      };
    }
    if (u !== void 0) {
      if (d === void 0 || f === void 0 || g === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: u,
        schemaPath: d,
        topSchemaRef: g,
        errSchemaPath: f
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Ze.getSubschema = r;
  function n(i, c, { dataProp: a, dataPropType: u, data: d, dataTypes: f, propertyName: g }) {
    if (d !== void 0 && a !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: R } = c;
    if (a !== void 0) {
      const { errorPath: _, dataPathArr: w, opts: $ } = c, y = R.let("data", (0, t._)`${c.data}${(0, t.getProperty)(a)}`, !0);
      E(y), i.errorPath = (0, t.str)`${_}${(0, e.getErrorPath)(a, u, $.jsPropertySyntax)}`, i.parentDataProperty = (0, t._)`${a}`, i.dataPathArr = [...w, i.parentDataProperty];
    }
    if (d !== void 0) {
      const _ = d instanceof t.Name ? d : R.let("data", d, !0);
      E(_), g !== void 0 && (i.propertyName = g);
    }
    f && (i.dataTypes = f);
    function E(_) {
      i.data = _, i.dataLevel = c.dataLevel + 1, i.dataTypes = [], c.definedProperties = /* @__PURE__ */ new Set(), i.parentData = c.data, i.dataNames = [...c.dataNames, _];
    }
  }
  Ze.extendSubschemaData = n;
  function s(i, { jtdDiscriminator: c, jtdMetadata: a, compositeRule: u, createErrors: d, allErrors: f }) {
    u !== void 0 && (i.compositeRule = u), d !== void 0 && (i.createErrors = d), f !== void 0 && (i.allErrors = f), i.jtdDiscriminator = c, i.jtdMetadata = a;
  }
  return Ze.extendSubschemaMode = s, Ze;
}
var Pe = {}, js = function t(e, r) {
  if (e === r)
    return !0;
  if (e && r && typeof e == "object" && typeof r == "object") {
    if (e.constructor !== r.constructor)
      return !1;
    var n, s, i;
    if (Array.isArray(e)) {
      if (n = e.length, n != r.length)
        return !1;
      for (s = n; s-- !== 0; )
        if (!t(e[s], r[s]))
          return !1;
      return !0;
    }
    if (e.constructor === RegExp)
      return e.source === r.source && e.flags === r.flags;
    if (e.valueOf !== Object.prototype.valueOf)
      return e.valueOf() === r.valueOf();
    if (e.toString !== Object.prototype.toString)
      return e.toString() === r.toString();
    if (i = Object.keys(e), n = i.length, n !== Object.keys(r).length)
      return !1;
    for (s = n; s-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(r, i[s]))
        return !1;
    for (s = n; s-- !== 0; ) {
      var c = i[s];
      if (!t(e[c], r[c]))
        return !1;
    }
    return !0;
  }
  return e !== e && r !== r;
}, ks = { exports: {} }, nt = ks.exports = function(t, e, r) {
  typeof e == "function" && (r = e, e = {}), r = e.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  nr(e, n, s, t, "", t);
};
nt.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
nt.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
nt.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
nt.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function nr(t, e, r, n, s, i, c, a, u, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    e(n, s, i, c, a, u, d);
    for (var f in n) {
      var g = n[f];
      if (Array.isArray(g)) {
        if (f in nt.arrayKeywords)
          for (var R = 0; R < g.length; R++)
            nr(t, e, r, g[R], s + "/" + f + "/" + R, i, s, f, n, R);
      } else if (f in nt.propsKeywords) {
        if (g && typeof g == "object")
          for (var E in g)
            nr(t, e, r, g[E], s + "/" + f + "/" + Ao(E), i, s, f, n, E);
      } else
        (f in nt.keywords || t.allKeys && !(f in nt.skipKeywords)) && nr(t, e, r, g, s + "/" + f, i, s, f, n);
    }
    r(n, s, i, c, a, u, d);
  }
}
function Ao(t) {
  return t.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Do = ks.exports;
Object.defineProperty(Pe, "__esModule", { value: !0 });
Pe.getSchemaRefs = Pe.resolveUrl = Pe.normalizeId = Pe._getFullPath = Pe.getFullPath = Pe.inlineRef = void 0;
const Fo = ne, Mo = js, qo = Do, Uo = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function Lo(t, e = !0) {
  return typeof t == "boolean" ? !0 : e === !0 ? !Er(t) : e ? Is(t) <= e : !1;
}
Pe.inlineRef = Lo;
const Vo = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Er(t) {
  for (const e in t) {
    if (Vo.has(e))
      return !0;
    const r = t[e];
    if (Array.isArray(r) && r.some(Er) || typeof r == "object" && Er(r))
      return !0;
  }
  return !1;
}
function Is(t) {
  let e = 0;
  for (const r in t) {
    if (r === "$ref")
      return 1 / 0;
    if (e++, !Uo.has(r) && (typeof t[r] == "object" && (0, Fo.eachItem)(t[r], (n) => e += Is(n)), e === 1 / 0))
      return 1 / 0;
  }
  return e;
}
function As(t, e = "", r) {
  r !== !1 && (e = Pt(e));
  const n = t.parse(e);
  return Ds(t, n);
}
Pe.getFullPath = As;
function Ds(t, e) {
  return t.serialize(e).split("#")[0] + "#";
}
Pe._getFullPath = Ds;
const zo = /#\/?$/;
function Pt(t) {
  return t ? t.replace(zo, "") : "";
}
Pe.normalizeId = Pt;
function Ho(t, e, r) {
  return r = Pt(r), t.resolve(e, r);
}
Pe.resolveUrl = Ho;
const Ko = /^[a-z_][-a-z0-9._]*$/i;
function Wo(t, e) {
  if (typeof t == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = Pt(t[r] || e), i = { "": s }, c = As(n, s, !1), a = {}, u = /* @__PURE__ */ new Set();
  return qo(t, { allKeys: !0 }, (g, R, E, _) => {
    if (_ === void 0)
      return;
    const w = c + R;
    let $ = i[_];
    typeof g[r] == "string" && ($ = y.call(this, g[r])), j.call(this, g.$anchor), j.call(this, g.$dynamicAnchor), i[R] = $;
    function y(O) {
      const A = this.opts.uriResolver.resolve;
      if (O = Pt($ ? A($, O) : O), u.has(O))
        throw f(O);
      u.add(O);
      let q = this.refs[O];
      return typeof q == "string" && (q = this.refs[q]), typeof q == "object" ? d(g, q.schema, O) : O !== Pt(w) && (O[0] === "#" ? (d(g, a[O], O), a[O] = g) : this.refs[O] = w), O;
    }
    function j(O) {
      if (typeof O == "string") {
        if (!Ko.test(O))
          throw new Error(`invalid anchor "${O}"`);
        y.call(this, `#${O}`);
      }
    }
  }), a;
  function d(g, R, E) {
    if (R !== void 0 && !Mo(g, R))
      throw f(E);
  }
  function f(g) {
    return new Error(`reference "${g}" resolves to more than one schema`);
  }
}
Pe.getSchemaRefs = Wo;
var Qn;
function fr() {
  if (Qn)
    return Ye;
  Qn = 1, Object.defineProperty(Ye, "__esModule", { value: !0 }), Ye.getData = Ye.KeywordCxt = Ye.validateFunctionCode = void 0;
  const t = mo(), e = zt, r = Ns(), n = zt, s = _o(), i = ko(), c = Io(), a = ee, u = Ge, d = Pe, f = ne, g = Ht;
  function R(v) {
    if (q(v) && (k(v), A(v))) {
      $(v);
      return;
    }
    E(v, () => (0, t.topBoolOrEmptySchema)(v));
  }
  Ye.validateFunctionCode = R;
  function E({ gen: v, validateName: P, schema: D, schemaEnv: U, opts: H }, B) {
    H.code.es5 ? v.func(P, (0, a._)`${u.default.data}, ${u.default.valCxt}`, U.$async, () => {
      v.code((0, a._)`"use strict"; ${j(D, H)}`), w(v, H), v.code(B);
    }) : v.func(P, (0, a._)`${u.default.data}, ${_(H)}`, U.$async, () => v.code(j(D, H)).code(B));
  }
  function _(v) {
    return (0, a._)`{${u.default.instancePath}="", ${u.default.parentData}, ${u.default.parentDataProperty}, ${u.default.rootData}=${u.default.data}${v.dynamicRef ? (0, a._)`, ${u.default.dynamicAnchors}={}` : a.nil}}={}`;
  }
  function w(v, P) {
    v.if(u.default.valCxt, () => {
      v.var(u.default.instancePath, (0, a._)`${u.default.valCxt}.${u.default.instancePath}`), v.var(u.default.parentData, (0, a._)`${u.default.valCxt}.${u.default.parentData}`), v.var(u.default.parentDataProperty, (0, a._)`${u.default.valCxt}.${u.default.parentDataProperty}`), v.var(u.default.rootData, (0, a._)`${u.default.valCxt}.${u.default.rootData}`), P.dynamicRef && v.var(u.default.dynamicAnchors, (0, a._)`${u.default.valCxt}.${u.default.dynamicAnchors}`);
    }, () => {
      v.var(u.default.instancePath, (0, a._)`""`), v.var(u.default.parentData, (0, a._)`undefined`), v.var(u.default.parentDataProperty, (0, a._)`undefined`), v.var(u.default.rootData, u.default.data), P.dynamicRef && v.var(u.default.dynamicAnchors, (0, a._)`{}`);
    });
  }
  function $(v) {
    const { schema: P, opts: D, gen: U } = v;
    E(v, () => {
      D.$comment && P.$comment && ae(v), Y(v), U.let(u.default.vErrors, null), U.let(u.default.errors, 0), D.unevaluated && y(v), M(v), se(v);
    });
  }
  function y(v) {
    const { gen: P, validateName: D } = v;
    v.evaluated = P.const("evaluated", (0, a._)`${D}.evaluated`), P.if((0, a._)`${v.evaluated}.dynamicProps`, () => P.assign((0, a._)`${v.evaluated}.props`, (0, a._)`undefined`)), P.if((0, a._)`${v.evaluated}.dynamicItems`, () => P.assign((0, a._)`${v.evaluated}.items`, (0, a._)`undefined`));
  }
  function j(v, P) {
    const D = typeof v == "object" && v[P.schemaId];
    return D && (P.code.source || P.code.process) ? (0, a._)`/*# sourceURL=${D} */` : a.nil;
  }
  function O(v, P) {
    if (q(v) && (k(v), A(v))) {
      S(v, P);
      return;
    }
    (0, t.boolOrEmptySchema)(v, P);
  }
  function A({ schema: v, self: P }) {
    if (typeof v == "boolean")
      return !v;
    for (const D in v)
      if (P.RULES.all[D])
        return !0;
    return !1;
  }
  function q(v) {
    return typeof v.schema != "boolean";
  }
  function S(v, P) {
    const { schema: D, gen: U, opts: H } = v;
    H.$comment && D.$comment && ae(v), oe(v), x(v);
    const B = U.const("_errs", u.default.errors);
    M(v, B), U.var(P, (0, a._)`${B} === ${u.default.errors}`);
  }
  function k(v) {
    (0, f.checkUnknownRules)(v), G(v);
  }
  function M(v, P) {
    if (v.opts.jtd)
      return Ve(v, [], !1, P);
    const D = (0, e.getSchemaTypes)(v.schema), U = (0, e.coerceAndCheckDataType)(v, D);
    Ve(v, D, !U, P);
  }
  function G(v) {
    const { schema: P, errSchemaPath: D, opts: U, self: H } = v;
    P.$ref && U.ignoreKeywordsWithRef && (0, f.schemaHasRulesButRef)(P, H.RULES) && H.logger.warn(`$ref: keywords ignored in schema at path "${D}"`);
  }
  function Y(v) {
    const { schema: P, opts: D } = v;
    P.default !== void 0 && D.useDefaults && D.strictSchema && (0, f.checkStrictMode)(v, "default is ignored in the schema root");
  }
  function oe(v) {
    const P = v.schema[v.opts.schemaId];
    P && (v.baseId = (0, d.resolveUrl)(v.opts.uriResolver, v.baseId, P));
  }
  function x(v) {
    if (v.schema.$async && !v.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function ae({ gen: v, schemaEnv: P, schema: D, errSchemaPath: U, opts: H }) {
    const B = D.$comment;
    if (H.$comment === !0)
      v.code((0, a._)`${u.default.self}.logger.log(${B})`);
    else if (typeof H.$comment == "function") {
      const ve = (0, a.str)`${U}/$comment`, Te = v.scopeValue("root", { ref: P.root });
      v.code((0, a._)`${u.default.self}.opts.$comment(${B}, ${ve}, ${Te}.schema)`);
    }
  }
  function se(v) {
    const { gen: P, schemaEnv: D, validateName: U, ValidationError: H, opts: B } = v;
    D.$async ? P.if((0, a._)`${u.default.errors} === 0`, () => P.return(u.default.data), () => P.throw((0, a._)`new ${H}(${u.default.vErrors})`)) : (P.assign((0, a._)`${U}.errors`, u.default.vErrors), B.unevaluated && Ie(v), P.return((0, a._)`${u.default.errors} === 0`));
  }
  function Ie({ gen: v, evaluated: P, props: D, items: U }) {
    D instanceof a.Name && v.assign((0, a._)`${P}.props`, D), U instanceof a.Name && v.assign((0, a._)`${P}.items`, U);
  }
  function Ve(v, P, D, U) {
    const { gen: H, schema: B, data: ve, allErrors: Te, opts: _e, self: we } = v, { RULES: $e } = we;
    if (B.$ref && (_e.ignoreKeywordsWithRef || !(0, f.schemaHasRulesButRef)(B, $e))) {
      H.block(() => V(v, "$ref", $e.all.$ref.definition));
      return;
    }
    _e.jtd || st(v, P), H.block(() => {
      for (const pe of $e.rules)
        Oe(pe);
      Oe($e.post);
    });
    function Oe(pe) {
      (0, r.shouldUseGroup)(B, pe) && (pe.type ? (H.if((0, n.checkDataType)(pe.type, ve, _e.strictNumbers)), Be(v, pe), P.length === 1 && P[0] === pe.type && D && (H.else(), (0, n.reportTypeError)(v)), H.endIf()) : Be(v, pe), Te || H.if((0, a._)`${u.default.errors} === ${U || 0}`));
    }
  }
  function Be(v, P) {
    const { gen: D, schema: U, opts: { useDefaults: H } } = v;
    H && (0, s.assignDefaults)(v, P.type), D.block(() => {
      for (const B of P.rules)
        (0, r.shouldUseRule)(U, B) && V(v, B.keyword, B.definition, P.type);
    });
  }
  function st(v, P) {
    v.schemaEnv.meta || !v.opts.strictTypes || (Qe(v, P), v.opts.allowUnionTypes || L(v, P), b(v, v.dataTypes));
  }
  function Qe(v, P) {
    if (P.length) {
      if (!v.dataTypes.length) {
        v.dataTypes = P;
        return;
      }
      P.forEach((D) => {
        T(v.dataTypes, D) || h(v, `type "${D}" not allowed by context "${v.dataTypes.join(",")}"`);
      }), o(v, P);
    }
  }
  function L(v, P) {
    P.length > 1 && !(P.length === 2 && P.includes("null")) && h(v, "use allowUnionTypes to allow union type keyword");
  }
  function b(v, P) {
    const D = v.self.RULES.all;
    for (const U in D) {
      const H = D[U];
      if (typeof H == "object" && (0, r.shouldUseRule)(v.schema, H)) {
        const { type: B } = H.definition;
        B.length && !B.some((ve) => F(P, ve)) && h(v, `missing type "${B.join(",")}" for keyword "${U}"`);
      }
    }
  }
  function F(v, P) {
    return v.includes(P) || P === "number" && v.includes("integer");
  }
  function T(v, P) {
    return v.includes(P) || P === "integer" && v.includes("number");
  }
  function o(v, P) {
    const D = [];
    for (const U of v.dataTypes)
      T(P, U) ? D.push(U) : P.includes("integer") && U === "number" && D.push("integer");
    v.dataTypes = D;
  }
  function h(v, P) {
    const D = v.schemaEnv.baseId + v.errSchemaPath;
    P += ` at "${D}" (strictTypes)`, (0, f.checkStrictMode)(v, P, v.opts.strictTypes);
  }
  class I {
    constructor(P, D, U) {
      if ((0, i.validateKeywordUsage)(P, D, U), this.gen = P.gen, this.allErrors = P.allErrors, this.keyword = U, this.data = P.data, this.schema = P.schema[U], this.$data = D.$data && P.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, f.schemaRefOrVal)(P, this.schema, U, this.$data), this.schemaType = D.schemaType, this.parentSchema = P.schema, this.params = {}, this.it = P, this.def = D, this.$data)
        this.schemaCode = P.gen.const("vSchema", Q(this.$data, P));
      else if (this.schemaCode = this.schemaValue, !(0, i.validSchemaType)(this.schema, D.schemaType, D.allowUndefined))
        throw new Error(`${U} value must be ${JSON.stringify(D.schemaType)}`);
      ("code" in D ? D.trackErrors : D.errors !== !1) && (this.errsCount = P.gen.const("_errs", u.default.errors));
    }
    result(P, D, U) {
      this.failResult((0, a.not)(P), D, U);
    }
    failResult(P, D, U) {
      this.gen.if(P), U ? U() : this.error(), D ? (this.gen.else(), D(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(P, D) {
      this.failResult((0, a.not)(P), void 0, D);
    }
    fail(P) {
      if (P === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(P), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(P) {
      if (!this.$data)
        return this.fail(P);
      const { schemaCode: D } = this;
      this.fail((0, a._)`${D} !== undefined && (${(0, a.or)(this.invalid$data(), P)})`);
    }
    error(P, D, U) {
      if (D) {
        this.setParams(D), this._error(P, U), this.setParams({});
        return;
      }
      this._error(P, U);
    }
    _error(P, D) {
      (P ? g.reportExtraError : g.reportError)(this, this.def.error, D);
    }
    $dataError() {
      (0, g.reportError)(this, this.def.$dataError || g.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, g.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(P) {
      this.allErrors || this.gen.if(P);
    }
    setParams(P, D) {
      D ? Object.assign(this.params, P) : this.params = P;
    }
    block$data(P, D, U = a.nil) {
      this.gen.block(() => {
        this.check$data(P, U), D();
      });
    }
    check$data(P = a.nil, D = a.nil) {
      if (!this.$data)
        return;
      const { gen: U, schemaCode: H, schemaType: B, def: ve } = this;
      U.if((0, a.or)((0, a._)`${H} === undefined`, D)), P !== a.nil && U.assign(P, !0), (B.length || ve.validateSchema) && (U.elseIf(this.invalid$data()), this.$dataError(), P !== a.nil && U.assign(P, !1)), U.else();
    }
    invalid$data() {
      const { gen: P, schemaCode: D, schemaType: U, def: H, it: B } = this;
      return (0, a.or)(ve(), Te());
      function ve() {
        if (U.length) {
          if (!(D instanceof a.Name))
            throw new Error("ajv implementation error");
          const _e = Array.isArray(U) ? U : [U];
          return (0, a._)`${(0, n.checkDataTypes)(_e, D, B.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return a.nil;
      }
      function Te() {
        if (H.validateSchema) {
          const _e = P.scopeValue("validate$data", { ref: H.validateSchema });
          return (0, a._)`!${_e}(${D})`;
        }
        return a.nil;
      }
    }
    subschema(P, D) {
      const U = (0, c.getSubschema)(this.it, P);
      (0, c.extendSubschemaData)(U, this.it, P), (0, c.extendSubschemaMode)(U, P);
      const H = { ...this.it, ...U, items: void 0, props: void 0 };
      return O(H, D), H;
    }
    mergeEvaluated(P, D) {
      const { it: U, gen: H } = this;
      U.opts.unevaluated && (U.props !== !0 && P.props !== void 0 && (U.props = f.mergeEvaluated.props(H, P.props, U.props, D)), U.items !== !0 && P.items !== void 0 && (U.items = f.mergeEvaluated.items(H, P.items, U.items, D)));
    }
    mergeValidEvaluated(P, D) {
      const { it: U, gen: H } = this;
      if (U.opts.unevaluated && (U.props !== !0 || U.items !== !0))
        return H.if(D, () => this.mergeEvaluated(P, a.Name)), !0;
    }
  }
  Ye.KeywordCxt = I;
  function V(v, P, D, U) {
    const H = new I(v, D, P);
    "code" in D ? D.code(H, U) : H.$data && D.validate ? (0, i.funcKeywordCode)(H, D) : "macro" in D ? (0, i.macroKeywordCode)(H, D) : (D.compile || D.validate) && (0, i.funcKeywordCode)(H, D);
  }
  const z = /^\/(?:[^~]|~0|~1)*$/, Z = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function Q(v, { dataLevel: P, dataNames: D, dataPathArr: U }) {
    let H, B;
    if (v === "")
      return u.default.rootData;
    if (v[0] === "/") {
      if (!z.test(v))
        throw new Error(`Invalid JSON-pointer: ${v}`);
      H = v, B = u.default.rootData;
    } else {
      const we = Z.exec(v);
      if (!we)
        throw new Error(`Invalid JSON-pointer: ${v}`);
      const $e = +we[1];
      if (H = we[2], H === "#") {
        if ($e >= P)
          throw new Error(_e("property/index", $e));
        return U[P - $e];
      }
      if ($e > P)
        throw new Error(_e("data", $e));
      if (B = D[P - $e], !H)
        return B;
    }
    let ve = B;
    const Te = H.split("/");
    for (const we of Te)
      we && (B = (0, a._)`${B}${(0, a.getProperty)((0, f.unescapeJsonPointer)(we))}`, ve = (0, a._)`${ve} && ${B}`);
    return ve;
    function _e(we, $e) {
      return `Cannot access ${we} ${$e} levels up, current level is ${P}`;
    }
  }
  return Ye.getData = Q, Ye;
}
var Yt = {}, Xn;
function Lr() {
  if (Xn)
    return Yt;
  Xn = 1, Object.defineProperty(Yt, "__esModule", { value: !0 });
  class t extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return Yt.default = t, Yt;
}
var xt = {}, es;
function Vr() {
  if (es)
    return xt;
  es = 1, Object.defineProperty(xt, "__esModule", { value: !0 });
  const t = Pe;
  class e extends Error {
    constructor(n, s, i, c) {
      super(c || `can't resolve reference ${i} from id ${s}`), this.missingRef = (0, t.resolveUrl)(n, s, i), this.missingSchema = (0, t.normalizeId)((0, t.getFullPath)(n, this.missingRef));
    }
  }
  return xt.default = e, xt;
}
var Ne = {};
Object.defineProperty(Ne, "__esModule", { value: !0 });
Ne.resolveSchema = Ne.getCompilingSchema = Ne.resolveRef = Ne.compileSchema = Ne.SchemaEnv = void 0;
const De = ee, Go = Lr(), ut = Ge, Me = Pe, ts = ne, Bo = fr();
class pr {
  constructor(e) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof e.schema == "object" && (n = e.schema), this.schema = e.schema, this.schemaId = e.schemaId, this.root = e.root || this, this.baseId = (r = e.baseId) !== null && r !== void 0 ? r : (0, Me.normalizeId)(n?.[e.schemaId || "$id"]), this.schemaPath = e.schemaPath, this.localRefs = e.localRefs, this.meta = e.meta, this.$async = n?.$async, this.refs = {};
  }
}
Ne.SchemaEnv = pr;
function zr(t) {
  const e = Fs.call(this, t);
  if (e)
    return e;
  const r = (0, Me.getFullPath)(this.opts.uriResolver, t.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: i } = this.opts, c = new De.CodeGen(this.scope, { es5: n, lines: s, ownProperties: i });
  let a;
  t.$async && (a = c.scopeValue("Error", {
    ref: Go.default,
    code: (0, De._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const u = c.scopeName("validate");
  t.validateName = u;
  const d = {
    gen: c,
    allErrors: this.opts.allErrors,
    data: ut.default.data,
    parentData: ut.default.parentData,
    parentDataProperty: ut.default.parentDataProperty,
    dataNames: [ut.default.data],
    dataPathArr: [De.nil],
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: c.scopeValue("schema", this.opts.code.source === !0 ? { ref: t.schema, code: (0, De.stringify)(t.schema) } : { ref: t.schema }),
    validateName: u,
    ValidationError: a,
    schema: t.schema,
    schemaEnv: t,
    rootId: r,
    baseId: t.baseId || r,
    schemaPath: De.nil,
    errSchemaPath: t.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, De._)`""`,
    opts: this.opts,
    self: this
  };
  let f;
  try {
    this._compilations.add(t), (0, Bo.validateFunctionCode)(d), c.optimize(this.opts.code.optimize);
    const g = c.toString();
    f = `${c.scopeRefs(ut.default.scope)}return ${g}`, this.opts.code.process && (f = this.opts.code.process(f, t));
    const E = new Function(`${ut.default.self}`, `${ut.default.scope}`, f)(this, this.scope.get());
    if (this.scope.value(u, { ref: E }), E.errors = null, E.schema = t.schema, E.schemaEnv = t, t.$async && (E.$async = !0), this.opts.code.source === !0 && (E.source = { validateName: u, validateCode: g, scopeValues: c._values }), this.opts.unevaluated) {
      const { props: _, items: w } = d;
      E.evaluated = {
        props: _ instanceof De.Name ? void 0 : _,
        items: w instanceof De.Name ? void 0 : w,
        dynamicProps: _ instanceof De.Name,
        dynamicItems: w instanceof De.Name
      }, E.source && (E.source.evaluated = (0, De.stringify)(E.evaluated));
    }
    return t.validate = E, t;
  } catch (g) {
    throw delete t.validate, delete t.validateName, f && this.logger.error("Error compiling schema, function code:", f), g;
  } finally {
    this._compilations.delete(t);
  }
}
Ne.compileSchema = zr;
function Jo(t, e, r) {
  var n;
  r = (0, Me.resolveUrl)(this.opts.uriResolver, e, r);
  const s = t.refs[r];
  if (s)
    return s;
  let i = Zo.call(this, t, r);
  if (i === void 0) {
    const c = (n = t.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: a } = this.opts;
    c && (i = new pr({ schema: c, schemaId: a, root: t, baseId: e }));
  }
  if (i !== void 0)
    return t.refs[r] = Yo.call(this, i);
}
Ne.resolveRef = Jo;
function Yo(t) {
  return (0, Me.inlineRef)(t.schema, this.opts.inlineRefs) ? t.schema : t.validate ? t : zr.call(this, t);
}
function Fs(t) {
  for (const e of this._compilations)
    if (xo(e, t))
      return e;
}
Ne.getCompilingSchema = Fs;
function xo(t, e) {
  return t.schema === e.schema && t.root === e.root && t.baseId === e.baseId;
}
function Zo(t, e) {
  let r;
  for (; typeof (r = this.refs[e]) == "string"; )
    e = r;
  return r || this.schemas[e] || hr.call(this, t, e);
}
function hr(t, e) {
  const r = this.opts.uriResolver.parse(e), n = (0, Me._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Me.getFullPath)(this.opts.uriResolver, t.baseId, void 0);
  if (Object.keys(t.schema).length > 0 && n === s)
    return vr.call(this, r, t);
  const i = (0, Me.normalizeId)(n), c = this.refs[i] || this.schemas[i];
  if (typeof c == "string") {
    const a = hr.call(this, t, c);
    return typeof a?.schema != "object" ? void 0 : vr.call(this, r, a);
  }
  if (typeof c?.schema == "object") {
    if (c.validate || zr.call(this, c), i === (0, Me.normalizeId)(e)) {
      const { schema: a } = c, { schemaId: u } = this.opts, d = a[u];
      return d && (s = (0, Me.resolveUrl)(this.opts.uriResolver, s, d)), new pr({ schema: a, schemaId: u, root: t, baseId: s });
    }
    return vr.call(this, r, c);
  }
}
Ne.resolveSchema = hr;
const Qo = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function vr(t, { baseId: e, schema: r, root: n }) {
  var s;
  if (((s = t.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const a of t.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const u = r[(0, ts.unescapeFragment)(a)];
    if (u === void 0)
      return;
    r = u;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Qo.has(a) && d && (e = (0, Me.resolveUrl)(this.opts.uriResolver, e, d));
  }
  let i;
  if (typeof r != "boolean" && r.$ref && !(0, ts.schemaHasRulesButRef)(r, this.RULES)) {
    const a = (0, Me.resolveUrl)(this.opts.uriResolver, e, r.$ref);
    i = hr.call(this, n, a);
  }
  const { schemaId: c } = this.opts;
  if (i = i || new pr({ schema: r, schemaId: c, root: n, baseId: e }), i.schema !== i.root.schema)
    return i;
}
const Xo = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", ea = "Meta-schema for $data reference (JSON AnySchema extension proposal)", ta = "object", ra = [
  "$data"
], na = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, sa = !1, ia = {
  $id: Xo,
  description: ea,
  type: ta,
  required: ra,
  properties: na,
  additionalProperties: sa
};
var Hr = {}, Sr = { exports: {} };
/** @license URI.js v4.4.1 (c) 2011 Gary Court. License: http://github.com/garycourt/uri-js */
(function(t, e) {
  (function(r, n) {
    n(e);
  })(fo, function(r) {
    function n() {
      for (var p = arguments.length, l = Array(p), m = 0; m < p; m++)
        l[m] = arguments[m];
      if (l.length > 1) {
        l[0] = l[0].slice(0, -1);
        for (var C = l.length - 1, N = 1; N < C; ++N)
          l[N] = l[N].slice(1, -1);
        return l[C] = l[C].slice(1), l.join("");
      } else
        return l[0];
    }
    function s(p) {
      return "(?:" + p + ")";
    }
    function i(p) {
      return p === void 0 ? "undefined" : p === null ? "null" : Object.prototype.toString.call(p).split(" ").pop().split("]").shift().toLowerCase();
    }
    function c(p) {
      return p.toUpperCase();
    }
    function a(p) {
      return p != null ? p instanceof Array ? p : typeof p.length != "number" || p.split || p.setInterval || p.call ? [p] : Array.prototype.slice.call(p) : [];
    }
    function u(p, l) {
      var m = p;
      if (l)
        for (var C in l)
          m[C] = l[C];
      return m;
    }
    function d(p) {
      var l = "[A-Za-z]", m = "[0-9]", C = n(m, "[A-Fa-f]"), N = s(s("%[EFef]" + C + "%" + C + C + "%" + C + C) + "|" + s("%[89A-Fa-f]" + C + "%" + C + C) + "|" + s("%" + C + C)), K = "[\\:\\/\\?\\#\\[\\]\\@]", W = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]", re = n(K, W), le = p ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]" : "[]", he = p ? "[\\uE000-\\uF8FF]" : "[]", te = n(l, m, "[\\-\\.\\_\\~]", le);
      s(l + n(l, m, "[\\+\\-\\.]") + "*"), s(s(N + "|" + n(te, W, "[\\:]")) + "*");
      var ce = s(s("25[0-5]") + "|" + s("2[0-4]" + m) + "|" + s("1" + m + m) + "|" + s("0?[1-9]" + m) + "|0?0?" + m), me = s(ce + "\\." + ce + "\\." + ce + "\\." + ce), J = s(C + "{1,4}"), de = s(s(J + "\\:" + J) + "|" + me), ge = s(s(J + "\\:") + "{6}" + de), fe = s("\\:\\:" + s(J + "\\:") + "{5}" + de), Xe = s(s(J) + "?\\:\\:" + s(J + "\\:") + "{4}" + de), He = s(s(s(J + "\\:") + "{0,1}" + J) + "?\\:\\:" + s(J + "\\:") + "{3}" + de), Ke = s(s(s(J + "\\:") + "{0,2}" + J) + "?\\:\\:" + s(J + "\\:") + "{2}" + de), vt = s(s(s(J + "\\:") + "{0,3}" + J) + "?\\:\\:" + J + "\\:" + de), at = s(s(s(J + "\\:") + "{0,4}" + J) + "?\\:\\:" + de), je = s(s(s(J + "\\:") + "{0,5}" + J) + "?\\:\\:" + J), We = s(s(s(J + "\\:") + "{0,6}" + J) + "?\\:\\:"), ct = s([ge, fe, Xe, He, Ke, vt, at, je, We].join("|")), Je = s(s(te + "|" + N) + "+");
      s("[vV]" + C + "+\\." + n(te, W, "[\\:]") + "+"), s(s(N + "|" + n(te, W)) + "*");
      var jt = s(N + "|" + n(te, W, "[\\:\\@]"));
      return s(s(N + "|" + n(te, W, "[\\@]")) + "+"), s(s(jt + "|" + n("[\\/\\?]", he)) + "*"), {
        NOT_SCHEME: new RegExp(n("[^]", l, m, "[\\+\\-\\.]"), "g"),
        NOT_USERINFO: new RegExp(n("[^\\%\\:]", te, W), "g"),
        NOT_HOST: new RegExp(n("[^\\%\\[\\]\\:]", te, W), "g"),
        NOT_PATH: new RegExp(n("[^\\%\\/\\:\\@]", te, W), "g"),
        NOT_PATH_NOSCHEME: new RegExp(n("[^\\%\\/\\@]", te, W), "g"),
        NOT_QUERY: new RegExp(n("[^\\%]", te, W, "[\\:\\@\\/\\?]", he), "g"),
        NOT_FRAGMENT: new RegExp(n("[^\\%]", te, W, "[\\:\\@\\/\\?]"), "g"),
        ESCAPE: new RegExp(n("[^]", te, W), "g"),
        UNRESERVED: new RegExp(te, "g"),
        OTHER_CHARS: new RegExp(n("[^\\%]", te, re), "g"),
        PCT_ENCODED: new RegExp(N, "g"),
        IPV4ADDRESS: new RegExp("^(" + me + ")$"),
        IPV6ADDRESS: new RegExp("^\\[?(" + ct + ")" + s(s("\\%25|\\%(?!" + C + "{2})") + "(" + Je + ")") + "?\\]?$")
        //RFC 6874, with relaxed parsing rules
      };
    }
    var f = d(!1), g = d(!0), R = function() {
      function p(l, m) {
        var C = [], N = !0, K = !1, W = void 0;
        try {
          for (var re = l[Symbol.iterator](), le; !(N = (le = re.next()).done) && (C.push(le.value), !(m && C.length === m)); N = !0)
            ;
        } catch (he) {
          K = !0, W = he;
        } finally {
          try {
            !N && re.return && re.return();
          } finally {
            if (K)
              throw W;
          }
        }
        return C;
      }
      return function(l, m) {
        if (Array.isArray(l))
          return l;
        if (Symbol.iterator in Object(l))
          return p(l, m);
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      };
    }(), E = function(p) {
      if (Array.isArray(p)) {
        for (var l = 0, m = Array(p.length); l < p.length; l++)
          m[l] = p[l];
        return m;
      } else
        return Array.from(p);
    }, _ = 2147483647, w = 36, $ = 1, y = 26, j = 38, O = 700, A = 72, q = 128, S = "-", k = /^xn--/, M = /[^\0-\x7E]/, G = /[\x2E\u3002\uFF0E\uFF61]/g, Y = {
      overflow: "Overflow: input needs wider integers to process",
      "not-basic": "Illegal input >= 0x80 (not a basic code point)",
      "invalid-input": "Invalid input"
    }, oe = w - $, x = Math.floor, ae = String.fromCharCode;
    function se(p) {
      throw new RangeError(Y[p]);
    }
    function Ie(p, l) {
      for (var m = [], C = p.length; C--; )
        m[C] = l(p[C]);
      return m;
    }
    function Ve(p, l) {
      var m = p.split("@"), C = "";
      m.length > 1 && (C = m[0] + "@", p = m[1]), p = p.replace(G, ".");
      var N = p.split("."), K = Ie(N, l).join(".");
      return C + K;
    }
    function Be(p) {
      for (var l = [], m = 0, C = p.length; m < C; ) {
        var N = p.charCodeAt(m++);
        if (N >= 55296 && N <= 56319 && m < C) {
          var K = p.charCodeAt(m++);
          (K & 64512) == 56320 ? l.push(((N & 1023) << 10) + (K & 1023) + 65536) : (l.push(N), m--);
        } else
          l.push(N);
      }
      return l;
    }
    var st = function(l) {
      return String.fromCodePoint.apply(String, E(l));
    }, Qe = function(l) {
      return l - 48 < 10 ? l - 22 : l - 65 < 26 ? l - 65 : l - 97 < 26 ? l - 97 : w;
    }, L = function(l, m) {
      return l + 22 + 75 * (l < 26) - ((m != 0) << 5);
    }, b = function(l, m, C) {
      var N = 0;
      for (
        l = C ? x(l / O) : l >> 1, l += x(l / m);
        /* no initialization */
        l > oe * y >> 1;
        N += w
      )
        l = x(l / oe);
      return x(N + (oe + 1) * l / (l + j));
    }, F = function(l) {
      var m = [], C = l.length, N = 0, K = q, W = A, re = l.lastIndexOf(S);
      re < 0 && (re = 0);
      for (var le = 0; le < re; ++le)
        l.charCodeAt(le) >= 128 && se("not-basic"), m.push(l.charCodeAt(le));
      for (var he = re > 0 ? re + 1 : 0; he < C; ) {
        for (
          var te = N, ce = 1, me = w;
          ;
          /* no condition */
          me += w
        ) {
          he >= C && se("invalid-input");
          var J = Qe(l.charCodeAt(he++));
          (J >= w || J > x((_ - N) / ce)) && se("overflow"), N += J * ce;
          var de = me <= W ? $ : me >= W + y ? y : me - W;
          if (J < de)
            break;
          var ge = w - de;
          ce > x(_ / ge) && se("overflow"), ce *= ge;
        }
        var fe = m.length + 1;
        W = b(N - te, fe, te == 0), x(N / fe) > _ - K && se("overflow"), K += x(N / fe), N %= fe, m.splice(N++, 0, K);
      }
      return String.fromCodePoint.apply(String, m);
    }, T = function(l) {
      var m = [];
      l = Be(l);
      var C = l.length, N = q, K = 0, W = A, re = !0, le = !1, he = void 0;
      try {
        for (var te = l[Symbol.iterator](), ce; !(re = (ce = te.next()).done); re = !0) {
          var me = ce.value;
          me < 128 && m.push(ae(me));
        }
      } catch (kt) {
        le = !0, he = kt;
      } finally {
        try {
          !re && te.return && te.return();
        } finally {
          if (le)
            throw he;
        }
      }
      var J = m.length, de = J;
      for (J && m.push(S); de < C; ) {
        var ge = _, fe = !0, Xe = !1, He = void 0;
        try {
          for (var Ke = l[Symbol.iterator](), vt; !(fe = (vt = Ke.next()).done); fe = !0) {
            var at = vt.value;
            at >= N && at < ge && (ge = at);
          }
        } catch (kt) {
          Xe = !0, He = kt;
        } finally {
          try {
            !fe && Ke.return && Ke.return();
          } finally {
            if (Xe)
              throw He;
          }
        }
        var je = de + 1;
        ge - N > x((_ - K) / je) && se("overflow"), K += (ge - N) * je, N = ge;
        var We = !0, ct = !1, Je = void 0;
        try {
          for (var jt = l[Symbol.iterator](), Cn; !(We = (Cn = jt.next()).done); We = !0) {
            var jn = Cn.value;
            if (jn < N && ++K > _ && se("overflow"), jn == N) {
              for (
                var Gt = K, Bt = w;
                ;
                /* no condition */
                Bt += w
              ) {
                var Jt = Bt <= W ? $ : Bt >= W + y ? y : Bt - W;
                if (Gt < Jt)
                  break;
                var kn = Gt - Jt, In = w - Jt;
                m.push(ae(L(Jt + kn % In, 0))), Gt = x(kn / In);
              }
              m.push(ae(L(Gt, 0))), W = b(K, je, de == J), K = 0, ++de;
            }
          }
        } catch (kt) {
          ct = !0, Je = kt;
        } finally {
          try {
            !We && jt.return && jt.return();
          } finally {
            if (ct)
              throw Je;
          }
        }
        ++K, ++N;
      }
      return m.join("");
    }, o = function(l) {
      return Ve(l, function(m) {
        return k.test(m) ? F(m.slice(4).toLowerCase()) : m;
      });
    }, h = function(l) {
      return Ve(l, function(m) {
        return M.test(m) ? "xn--" + T(m) : m;
      });
    }, I = {
      /**
       * A string representing the current Punycode.js version number.
       * @memberOf punycode
       * @type String
       */
      version: "2.1.0",
      /**
       * An object of methods to convert from JavaScript's internal character
       * representation (UCS-2) to Unicode code points, and back.
       * @see <https://mathiasbynens.be/notes/javascript-encoding>
       * @memberOf punycode
       * @type Object
       */
      ucs2: {
        decode: Be,
        encode: st
      },
      decode: F,
      encode: T,
      toASCII: h,
      toUnicode: o
    }, V = {};
    function z(p) {
      var l = p.charCodeAt(0), m = void 0;
      return l < 16 ? m = "%0" + l.toString(16).toUpperCase() : l < 128 ? m = "%" + l.toString(16).toUpperCase() : l < 2048 ? m = "%" + (l >> 6 | 192).toString(16).toUpperCase() + "%" + (l & 63 | 128).toString(16).toUpperCase() : m = "%" + (l >> 12 | 224).toString(16).toUpperCase() + "%" + (l >> 6 & 63 | 128).toString(16).toUpperCase() + "%" + (l & 63 | 128).toString(16).toUpperCase(), m;
    }
    function Z(p) {
      for (var l = "", m = 0, C = p.length; m < C; ) {
        var N = parseInt(p.substr(m + 1, 2), 16);
        if (N < 128)
          l += String.fromCharCode(N), m += 3;
        else if (N >= 194 && N < 224) {
          if (C - m >= 6) {
            var K = parseInt(p.substr(m + 4, 2), 16);
            l += String.fromCharCode((N & 31) << 6 | K & 63);
          } else
            l += p.substr(m, 6);
          m += 6;
        } else if (N >= 224) {
          if (C - m >= 9) {
            var W = parseInt(p.substr(m + 4, 2), 16), re = parseInt(p.substr(m + 7, 2), 16);
            l += String.fromCharCode((N & 15) << 12 | (W & 63) << 6 | re & 63);
          } else
            l += p.substr(m, 9);
          m += 9;
        } else
          l += p.substr(m, 3), m += 3;
      }
      return l;
    }
    function Q(p, l) {
      function m(C) {
        var N = Z(C);
        return N.match(l.UNRESERVED) ? N : C;
      }
      return p.scheme && (p.scheme = String(p.scheme).replace(l.PCT_ENCODED, m).toLowerCase().replace(l.NOT_SCHEME, "")), p.userinfo !== void 0 && (p.userinfo = String(p.userinfo).replace(l.PCT_ENCODED, m).replace(l.NOT_USERINFO, z).replace(l.PCT_ENCODED, c)), p.host !== void 0 && (p.host = String(p.host).replace(l.PCT_ENCODED, m).toLowerCase().replace(l.NOT_HOST, z).replace(l.PCT_ENCODED, c)), p.path !== void 0 && (p.path = String(p.path).replace(l.PCT_ENCODED, m).replace(p.scheme ? l.NOT_PATH : l.NOT_PATH_NOSCHEME, z).replace(l.PCT_ENCODED, c)), p.query !== void 0 && (p.query = String(p.query).replace(l.PCT_ENCODED, m).replace(l.NOT_QUERY, z).replace(l.PCT_ENCODED, c)), p.fragment !== void 0 && (p.fragment = String(p.fragment).replace(l.PCT_ENCODED, m).replace(l.NOT_FRAGMENT, z).replace(l.PCT_ENCODED, c)), p;
    }
    function v(p) {
      return p.replace(/^0*(.*)/, "$1") || "0";
    }
    function P(p, l) {
      var m = p.match(l.IPV4ADDRESS) || [], C = R(m, 2), N = C[1];
      return N ? N.split(".").map(v).join(".") : p;
    }
    function D(p, l) {
      var m = p.match(l.IPV6ADDRESS) || [], C = R(m, 3), N = C[1], K = C[2];
      if (N) {
        for (var W = N.toLowerCase().split("::").reverse(), re = R(W, 2), le = re[0], he = re[1], te = he ? he.split(":").map(v) : [], ce = le.split(":").map(v), me = l.IPV4ADDRESS.test(ce[ce.length - 1]), J = me ? 7 : 8, de = ce.length - J, ge = Array(J), fe = 0; fe < J; ++fe)
          ge[fe] = te[fe] || ce[de + fe] || "";
        me && (ge[J - 1] = P(ge[J - 1], l));
        var Xe = ge.reduce(function(je, We, ct) {
          if (!We || We === "0") {
            var Je = je[je.length - 1];
            Je && Je.index + Je.length === ct ? Je.length++ : je.push({ index: ct, length: 1 });
          }
          return je;
        }, []), He = Xe.sort(function(je, We) {
          return We.length - je.length;
        })[0], Ke = void 0;
        if (He && He.length > 1) {
          var vt = ge.slice(0, He.index), at = ge.slice(He.index + He.length);
          Ke = vt.join(":") + "::" + at.join(":");
        } else
          Ke = ge.join(":");
        return K && (Ke += "%" + K), Ke;
      } else
        return p;
    }
    var U = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i, H = "".match(/(){0}/)[1] === void 0;
    function B(p) {
      var l = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, m = {}, C = l.iri !== !1 ? g : f;
      l.reference === "suffix" && (p = (l.scheme ? l.scheme + ":" : "") + "//" + p);
      var N = p.match(U);
      if (N) {
        H ? (m.scheme = N[1], m.userinfo = N[3], m.host = N[4], m.port = parseInt(N[5], 10), m.path = N[6] || "", m.query = N[7], m.fragment = N[8], isNaN(m.port) && (m.port = N[5])) : (m.scheme = N[1] || void 0, m.userinfo = p.indexOf("@") !== -1 ? N[3] : void 0, m.host = p.indexOf("//") !== -1 ? N[4] : void 0, m.port = parseInt(N[5], 10), m.path = N[6] || "", m.query = p.indexOf("?") !== -1 ? N[7] : void 0, m.fragment = p.indexOf("#") !== -1 ? N[8] : void 0, isNaN(m.port) && (m.port = p.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? N[4] : void 0)), m.host && (m.host = D(P(m.host, C), C)), m.scheme === void 0 && m.userinfo === void 0 && m.host === void 0 && m.port === void 0 && !m.path && m.query === void 0 ? m.reference = "same-document" : m.scheme === void 0 ? m.reference = "relative" : m.fragment === void 0 ? m.reference = "absolute" : m.reference = "uri", l.reference && l.reference !== "suffix" && l.reference !== m.reference && (m.error = m.error || "URI is not a " + l.reference + " reference.");
        var K = V[(l.scheme || m.scheme || "").toLowerCase()];
        if (!l.unicodeSupport && (!K || !K.unicodeSupport)) {
          if (m.host && (l.domainHost || K && K.domainHost))
            try {
              m.host = I.toASCII(m.host.replace(C.PCT_ENCODED, Z).toLowerCase());
            } catch (W) {
              m.error = m.error || "Host's domain name can not be converted to ASCII via punycode: " + W;
            }
          Q(m, f);
        } else
          Q(m, C);
        K && K.parse && K.parse(m, l);
      } else
        m.error = m.error || "URI can not be parsed.";
      return m;
    }
    function ve(p, l) {
      var m = l.iri !== !1 ? g : f, C = [];
      return p.userinfo !== void 0 && (C.push(p.userinfo), C.push("@")), p.host !== void 0 && C.push(D(P(String(p.host), m), m).replace(m.IPV6ADDRESS, function(N, K, W) {
        return "[" + K + (W ? "%25" + W : "") + "]";
      })), (typeof p.port == "number" || typeof p.port == "string") && (C.push(":"), C.push(String(p.port))), C.length ? C.join("") : void 0;
    }
    var Te = /^\.\.?\//, _e = /^\/\.(\/|$)/, we = /^\/\.\.(\/|$)/, $e = /^\/?(?:.|\n)*?(?=\/|$)/;
    function Oe(p) {
      for (var l = []; p.length; )
        if (p.match(Te))
          p = p.replace(Te, "");
        else if (p.match(_e))
          p = p.replace(_e, "/");
        else if (p.match(we))
          p = p.replace(we, "/"), l.pop();
        else if (p === "." || p === "..")
          p = "";
        else {
          var m = p.match($e);
          if (m) {
            var C = m[0];
            p = p.slice(C.length), l.push(C);
          } else
            throw new Error("Unexpected dot segment condition");
        }
      return l.join("");
    }
    function pe(p) {
      var l = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, m = l.iri ? g : f, C = [], N = V[(l.scheme || p.scheme || "").toLowerCase()];
      if (N && N.serialize && N.serialize(p, l), p.host && !m.IPV6ADDRESS.test(p.host)) {
        if (l.domainHost || N && N.domainHost)
          try {
            p.host = l.iri ? I.toUnicode(p.host) : I.toASCII(p.host.replace(m.PCT_ENCODED, Z).toLowerCase());
          } catch (re) {
            p.error = p.error || "Host's domain name can not be converted to " + (l.iri ? "Unicode" : "ASCII") + " via punycode: " + re;
          }
      }
      Q(p, m), l.reference !== "suffix" && p.scheme && (C.push(p.scheme), C.push(":"));
      var K = ve(p, l);
      if (K !== void 0 && (l.reference !== "suffix" && C.push("//"), C.push(K), p.path && p.path.charAt(0) !== "/" && C.push("/")), p.path !== void 0) {
        var W = p.path;
        !l.absolutePath && (!N || !N.absolutePath) && (W = Oe(W)), K === void 0 && (W = W.replace(/^\/\//, "/%2F")), C.push(W);
      }
      return p.query !== void 0 && (C.push("?"), C.push(p.query)), p.fragment !== void 0 && (C.push("#"), C.push(p.fragment)), C.join("");
    }
    function yt(p, l) {
      var m = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, C = arguments[3], N = {};
      return C || (p = B(pe(p, m), m), l = B(pe(l, m), m)), m = m || {}, !m.tolerant && l.scheme ? (N.scheme = l.scheme, N.userinfo = l.userinfo, N.host = l.host, N.port = l.port, N.path = Oe(l.path || ""), N.query = l.query) : (l.userinfo !== void 0 || l.host !== void 0 || l.port !== void 0 ? (N.userinfo = l.userinfo, N.host = l.host, N.port = l.port, N.path = Oe(l.path || ""), N.query = l.query) : (l.path ? (l.path.charAt(0) === "/" ? N.path = Oe(l.path) : ((p.userinfo !== void 0 || p.host !== void 0 || p.port !== void 0) && !p.path ? N.path = "/" + l.path : p.path ? N.path = p.path.slice(0, p.path.lastIndexOf("/") + 1) + l.path : N.path = l.path, N.path = Oe(N.path)), N.query = l.query) : (N.path = p.path, l.query !== void 0 ? N.query = l.query : N.query = p.query), N.userinfo = p.userinfo, N.host = p.host, N.port = p.port), N.scheme = p.scheme), N.fragment = l.fragment, N;
    }
    function Nt(p, l, m) {
      var C = u({ scheme: "null" }, m);
      return pe(yt(B(p, C), B(l, C), C, !0), C);
    }
    function it(p, l) {
      return typeof p == "string" ? p = pe(B(p, l), l) : i(p) === "object" && (p = B(pe(p, l), l)), p;
    }
    function Ot(p, l, m) {
      return typeof p == "string" ? p = pe(B(p, m), m) : i(p) === "object" && (p = pe(p, m)), typeof l == "string" ? l = pe(B(l, m), m) : i(l) === "object" && (l = pe(l, m)), p === l;
    }
    function Wt(p, l) {
      return p && p.toString().replace(!l || !l.iri ? f.ESCAPE : g.ESCAPE, z);
    }
    function Ce(p, l) {
      return p && p.toString().replace(!l || !l.iri ? f.PCT_ENCODED : g.PCT_ENCODED, Z);
    }
    var ot = {
      scheme: "http",
      domainHost: !0,
      parse: function(l, m) {
        return l.host || (l.error = l.error || "HTTP URIs must have a host."), l;
      },
      serialize: function(l, m) {
        var C = String(l.scheme).toLowerCase() === "https";
        return (l.port === (C ? 443 : 80) || l.port === "") && (l.port = void 0), l.path || (l.path = "/"), l;
      }
    }, bn = {
      scheme: "https",
      domainHost: ot.domainHost,
      parse: ot.parse,
      serialize: ot.serialize
    };
    function Pn(p) {
      return typeof p.secure == "boolean" ? p.secure : String(p.scheme).toLowerCase() === "wss";
    }
    var Ct = {
      scheme: "ws",
      domainHost: !0,
      parse: function(l, m) {
        var C = l;
        return C.secure = Pn(C), C.resourceName = (C.path || "/") + (C.query ? "?" + C.query : ""), C.path = void 0, C.query = void 0, C;
      },
      serialize: function(l, m) {
        if ((l.port === (Pn(l) ? 443 : 80) || l.port === "") && (l.port = void 0), typeof l.secure == "boolean" && (l.scheme = l.secure ? "wss" : "ws", l.secure = void 0), l.resourceName) {
          var C = l.resourceName.split("?"), N = R(C, 2), K = N[0], W = N[1];
          l.path = K && K !== "/" ? K : void 0, l.query = W, l.resourceName = void 0;
        }
        return l.fragment = void 0, l;
      }
    }, En = {
      scheme: "wss",
      domainHost: Ct.domainHost,
      parse: Ct.parse,
      serialize: Ct.serialize
    }, Bs = {}, Sn = "[A-Za-z0-9\\-\\.\\_\\~\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]", ze = "[0-9A-Fa-f]", Js = s(s("%[EFef]" + ze + "%" + ze + ze + "%" + ze + ze) + "|" + s("%[89A-Fa-f]" + ze + "%" + ze + ze) + "|" + s("%" + ze + ze)), Ys = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]", xs = "[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]", Zs = n(xs, '[\\"\\\\]'), Qs = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]", Xs = new RegExp(Sn, "g"), gt = new RegExp(Js, "g"), ei = new RegExp(n("[^]", Ys, "[\\.]", '[\\"]', Zs), "g"), Tn = new RegExp(n("[^]", Sn, Qs), "g"), ti = Tn;
    function yr(p) {
      var l = Z(p);
      return l.match(Xs) ? l : p;
    }
    var Rn = {
      scheme: "mailto",
      parse: function(l, m) {
        var C = l, N = C.to = C.path ? C.path.split(",") : [];
        if (C.path = void 0, C.query) {
          for (var K = !1, W = {}, re = C.query.split("&"), le = 0, he = re.length; le < he; ++le) {
            var te = re[le].split("=");
            switch (te[0]) {
              case "to":
                for (var ce = te[1].split(","), me = 0, J = ce.length; me < J; ++me)
                  N.push(ce[me]);
                break;
              case "subject":
                C.subject = Ce(te[1], m);
                break;
              case "body":
                C.body = Ce(te[1], m);
                break;
              default:
                K = !0, W[Ce(te[0], m)] = Ce(te[1], m);
                break;
            }
          }
          K && (C.headers = W);
        }
        C.query = void 0;
        for (var de = 0, ge = N.length; de < ge; ++de) {
          var fe = N[de].split("@");
          if (fe[0] = Ce(fe[0]), m.unicodeSupport)
            fe[1] = Ce(fe[1], m).toLowerCase();
          else
            try {
              fe[1] = I.toASCII(Ce(fe[1], m).toLowerCase());
            } catch (Xe) {
              C.error = C.error || "Email address's domain name can not be converted to ASCII via punycode: " + Xe;
            }
          N[de] = fe.join("@");
        }
        return C;
      },
      serialize: function(l, m) {
        var C = l, N = a(l.to);
        if (N) {
          for (var K = 0, W = N.length; K < W; ++K) {
            var re = String(N[K]), le = re.lastIndexOf("@"), he = re.slice(0, le).replace(gt, yr).replace(gt, c).replace(ei, z), te = re.slice(le + 1);
            try {
              te = m.iri ? I.toUnicode(te) : I.toASCII(Ce(te, m).toLowerCase());
            } catch (de) {
              C.error = C.error || "Email address's domain name can not be converted to " + (m.iri ? "Unicode" : "ASCII") + " via punycode: " + de;
            }
            N[K] = he + "@" + te;
          }
          C.path = N.join(",");
        }
        var ce = l.headers = l.headers || {};
        l.subject && (ce.subject = l.subject), l.body && (ce.body = l.body);
        var me = [];
        for (var J in ce)
          ce[J] !== Bs[J] && me.push(J.replace(gt, yr).replace(gt, c).replace(Tn, z) + "=" + ce[J].replace(gt, yr).replace(gt, c).replace(ti, z));
        return me.length && (C.query = me.join("&")), C;
      }
    }, ri = /^([^\:]+)\:(.*)/, Nn = {
      scheme: "urn",
      parse: function(l, m) {
        var C = l.path && l.path.match(ri), N = l;
        if (C) {
          var K = m.scheme || N.scheme || "urn", W = C[1].toLowerCase(), re = C[2], le = K + ":" + (m.nid || W), he = V[le];
          N.nid = W, N.nss = re, N.path = void 0, he && (N = he.parse(N, m));
        } else
          N.error = N.error || "URN can not be parsed.";
        return N;
      },
      serialize: function(l, m) {
        var C = m.scheme || l.scheme || "urn", N = l.nid, K = C + ":" + (m.nid || N), W = V[K];
        W && (l = W.serialize(l, m));
        var re = l, le = l.nss;
        return re.path = (N || m.nid) + ":" + le, re;
      }
    }, ni = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/, On = {
      scheme: "urn:uuid",
      parse: function(l, m) {
        var C = l;
        return C.uuid = C.nss, C.nss = void 0, !m.tolerant && (!C.uuid || !C.uuid.match(ni)) && (C.error = C.error || "UUID is not valid."), C;
      },
      serialize: function(l, m) {
        var C = l;
        return C.nss = (l.uuid || "").toLowerCase(), C;
      }
    };
    V[ot.scheme] = ot, V[bn.scheme] = bn, V[Ct.scheme] = Ct, V[En.scheme] = En, V[Rn.scheme] = Rn, V[Nn.scheme] = Nn, V[On.scheme] = On, r.SCHEMES = V, r.pctEncChar = z, r.pctDecChars = Z, r.parse = B, r.removeDotSegments = Oe, r.serialize = pe, r.resolveComponents = yt, r.resolve = Nt, r.normalize = it, r.equal = Ot, r.escapeComponent = Wt, r.unescapeComponent = Ce, Object.defineProperty(r, "__esModule", { value: !0 });
  });
})(Sr, Sr.exports);
var oa = Sr.exports;
Object.defineProperty(Hr, "__esModule", { value: !0 });
const Ms = oa;
Ms.code = 'require("ajv/dist/runtime/uri").default';
Hr.default = Ms;
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = void 0;
  var e = fr();
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return e.KeywordCxt;
  } });
  var r = ee;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = Lr(), s = Vr(), i = pt, c = Ne, a = ee, u = Pe, d = zt, f = ne, g = ia, R = Hr, E = (L, b) => new RegExp(L, b);
  E.code = "new RegExp";
  const _ = ["removeAdditional", "useDefaults", "coerceTypes"], w = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), $ = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, y = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, j = 200;
  function O(L) {
    var b, F, T, o, h, I, V, z, Z, Q, v, P, D, U, H, B, ve, Te, _e, we, $e, Oe, pe, yt, Nt;
    const it = L.strict, Ot = (b = L.code) === null || b === void 0 ? void 0 : b.optimize, Wt = Ot === !0 || Ot === void 0 ? 1 : Ot || 0, Ce = (T = (F = L.code) === null || F === void 0 ? void 0 : F.regExp) !== null && T !== void 0 ? T : E, ot = (o = L.uriResolver) !== null && o !== void 0 ? o : R.default;
    return {
      strictSchema: (I = (h = L.strictSchema) !== null && h !== void 0 ? h : it) !== null && I !== void 0 ? I : !0,
      strictNumbers: (z = (V = L.strictNumbers) !== null && V !== void 0 ? V : it) !== null && z !== void 0 ? z : !0,
      strictTypes: (Q = (Z = L.strictTypes) !== null && Z !== void 0 ? Z : it) !== null && Q !== void 0 ? Q : "log",
      strictTuples: (P = (v = L.strictTuples) !== null && v !== void 0 ? v : it) !== null && P !== void 0 ? P : "log",
      strictRequired: (U = (D = L.strictRequired) !== null && D !== void 0 ? D : it) !== null && U !== void 0 ? U : !1,
      code: L.code ? { ...L.code, optimize: Wt, regExp: Ce } : { optimize: Wt, regExp: Ce },
      loopRequired: (H = L.loopRequired) !== null && H !== void 0 ? H : j,
      loopEnum: (B = L.loopEnum) !== null && B !== void 0 ? B : j,
      meta: (ve = L.meta) !== null && ve !== void 0 ? ve : !0,
      messages: (Te = L.messages) !== null && Te !== void 0 ? Te : !0,
      inlineRefs: (_e = L.inlineRefs) !== null && _e !== void 0 ? _e : !0,
      schemaId: (we = L.schemaId) !== null && we !== void 0 ? we : "$id",
      addUsedSchema: ($e = L.addUsedSchema) !== null && $e !== void 0 ? $e : !0,
      validateSchema: (Oe = L.validateSchema) !== null && Oe !== void 0 ? Oe : !0,
      validateFormats: (pe = L.validateFormats) !== null && pe !== void 0 ? pe : !0,
      unicodeRegExp: (yt = L.unicodeRegExp) !== null && yt !== void 0 ? yt : !0,
      int32range: (Nt = L.int32range) !== null && Nt !== void 0 ? Nt : !0,
      uriResolver: ot
    };
  }
  class A {
    constructor(b = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), b = this.opts = { ...b, ...O(b) };
      const { es5: F, lines: T } = this.opts.code;
      this.scope = new a.ValueScope({ scope: {}, prefixes: w, es5: F, lines: T }), this.logger = x(b.logger);
      const o = b.validateFormats;
      b.validateFormats = !1, this.RULES = (0, i.getRules)(), q.call(this, $, b, "NOT SUPPORTED"), q.call(this, y, b, "DEPRECATED", "warn"), this._metaOpts = Y.call(this), b.formats && M.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), b.keywords && G.call(this, b.keywords), typeof b.meta == "object" && this.addMetaSchema(b.meta), k.call(this), b.validateFormats = o;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: b, meta: F, schemaId: T } = this.opts;
      let o = g;
      T === "id" && (o = { ...g }, o.id = o.$id, delete o.$id), F && b && this.addMetaSchema(o, o[T], !1);
    }
    defaultMeta() {
      const { meta: b, schemaId: F } = this.opts;
      return this.opts.defaultMeta = typeof b == "object" ? b[F] || b : void 0;
    }
    validate(b, F) {
      let T;
      if (typeof b == "string") {
        if (T = this.getSchema(b), !T)
          throw new Error(`no schema with key or ref "${b}"`);
      } else
        T = this.compile(b);
      const o = T(F);
      return "$async" in T || (this.errors = T.errors), o;
    }
    compile(b, F) {
      const T = this._addSchema(b, F);
      return T.validate || this._compileSchemaEnv(T);
    }
    compileAsync(b, F) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: T } = this.opts;
      return o.call(this, b, F);
      async function o(Q, v) {
        await h.call(this, Q.$schema);
        const P = this._addSchema(Q, v);
        return P.validate || I.call(this, P);
      }
      async function h(Q) {
        Q && !this.getSchema(Q) && await o.call(this, { $ref: Q }, !0);
      }
      async function I(Q) {
        try {
          return this._compileSchemaEnv(Q);
        } catch (v) {
          if (!(v instanceof s.default))
            throw v;
          return V.call(this, v), await z.call(this, v.missingSchema), I.call(this, Q);
        }
      }
      function V({ missingSchema: Q, missingRef: v }) {
        if (this.refs[Q])
          throw new Error(`AnySchema ${Q} is loaded but ${v} cannot be resolved`);
      }
      async function z(Q) {
        const v = await Z.call(this, Q);
        this.refs[Q] || await h.call(this, v.$schema), this.refs[Q] || this.addSchema(v, Q, F);
      }
      async function Z(Q) {
        const v = this._loading[Q];
        if (v)
          return v;
        try {
          return await (this._loading[Q] = T(Q));
        } finally {
          delete this._loading[Q];
        }
      }
    }
    // Adds schema to the instance
    addSchema(b, F, T, o = this.opts.validateSchema) {
      if (Array.isArray(b)) {
        for (const I of b)
          this.addSchema(I, void 0, T, o);
        return this;
      }
      let h;
      if (typeof b == "object") {
        const { schemaId: I } = this.opts;
        if (h = b[I], h !== void 0 && typeof h != "string")
          throw new Error(`schema ${I} must be string`);
      }
      return F = (0, u.normalizeId)(F || h), this._checkUnique(F), this.schemas[F] = this._addSchema(b, T, F, o, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(b, F, T = this.opts.validateSchema) {
      return this.addSchema(b, F, !0, T), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(b, F) {
      if (typeof b == "boolean")
        return !0;
      let T;
      if (T = b.$schema, T !== void 0 && typeof T != "string")
        throw new Error("$schema must be a string");
      if (T = T || this.opts.defaultMeta || this.defaultMeta(), !T)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const o = this.validate(T, b);
      if (!o && F) {
        const h = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(h);
        else
          throw new Error(h);
      }
      return o;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(b) {
      let F;
      for (; typeof (F = S.call(this, b)) == "string"; )
        b = F;
      if (F === void 0) {
        const { schemaId: T } = this.opts, o = new c.SchemaEnv({ schema: {}, schemaId: T });
        if (F = c.resolveSchema.call(this, o, b), !F)
          return;
        this.refs[b] = F;
      }
      return F.validate || this._compileSchemaEnv(F);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(b) {
      if (b instanceof RegExp)
        return this._removeAllSchemas(this.schemas, b), this._removeAllSchemas(this.refs, b), this;
      switch (typeof b) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const F = S.call(this, b);
          return typeof F == "object" && this._cache.delete(F.schema), delete this.schemas[b], delete this.refs[b], this;
        }
        case "object": {
          const F = b;
          this._cache.delete(F);
          let T = b[this.opts.schemaId];
          return T && (T = (0, u.normalizeId)(T), delete this.schemas[T], delete this.refs[T]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(b) {
      for (const F of b)
        this.addKeyword(F);
      return this;
    }
    addKeyword(b, F) {
      let T;
      if (typeof b == "string")
        T = b, typeof F == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), F.keyword = T);
      else if (typeof b == "object" && F === void 0) {
        if (F = b, T = F.keyword, Array.isArray(T) && !T.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (se.call(this, T, F), !F)
        return (0, f.eachItem)(T, (h) => Ie.call(this, h)), this;
      Be.call(this, F);
      const o = {
        ...F,
        type: (0, d.getJSONTypes)(F.type),
        schemaType: (0, d.getJSONTypes)(F.schemaType)
      };
      return (0, f.eachItem)(T, o.type.length === 0 ? (h) => Ie.call(this, h, o) : (h) => o.type.forEach((I) => Ie.call(this, h, o, I))), this;
    }
    getKeyword(b) {
      const F = this.RULES.all[b];
      return typeof F == "object" ? F.definition : !!F;
    }
    // Remove keyword
    removeKeyword(b) {
      const { RULES: F } = this;
      delete F.keywords[b], delete F.all[b];
      for (const T of F.rules) {
        const o = T.rules.findIndex((h) => h.keyword === b);
        o >= 0 && T.rules.splice(o, 1);
      }
      return this;
    }
    // Add format
    addFormat(b, F) {
      return typeof F == "string" && (F = new RegExp(F)), this.formats[b] = F, this;
    }
    errorsText(b = this.errors, { separator: F = ", ", dataVar: T = "data" } = {}) {
      return !b || b.length === 0 ? "No errors" : b.map((o) => `${T}${o.instancePath} ${o.message}`).reduce((o, h) => o + F + h);
    }
    $dataMetaSchema(b, F) {
      const T = this.RULES.all;
      b = JSON.parse(JSON.stringify(b));
      for (const o of F) {
        const h = o.split("/").slice(1);
        let I = b;
        for (const V of h)
          I = I[V];
        for (const V in T) {
          const z = T[V];
          if (typeof z != "object")
            continue;
          const { $data: Z } = z.definition, Q = I[V];
          Z && Q && (I[V] = Qe(Q));
        }
      }
      return b;
    }
    _removeAllSchemas(b, F) {
      for (const T in b) {
        const o = b[T];
        (!F || F.test(T)) && (typeof o == "string" ? delete b[T] : o && !o.meta && (this._cache.delete(o.schema), delete b[T]));
      }
    }
    _addSchema(b, F, T, o = this.opts.validateSchema, h = this.opts.addUsedSchema) {
      let I;
      const { schemaId: V } = this.opts;
      if (typeof b == "object")
        I = b[V];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof b != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let z = this._cache.get(b);
      if (z !== void 0)
        return z;
      T = (0, u.normalizeId)(I || T);
      const Z = u.getSchemaRefs.call(this, b, T);
      return z = new c.SchemaEnv({ schema: b, schemaId: V, meta: F, baseId: T, localRefs: Z }), this._cache.set(z.schema, z), h && !T.startsWith("#") && (T && this._checkUnique(T), this.refs[T] = z), o && this.validateSchema(b, !0), z;
    }
    _checkUnique(b) {
      if (this.schemas[b] || this.refs[b])
        throw new Error(`schema with key or id "${b}" already exists`);
    }
    _compileSchemaEnv(b) {
      if (b.meta ? this._compileMetaSchema(b) : c.compileSchema.call(this, b), !b.validate)
        throw new Error("ajv implementation error");
      return b.validate;
    }
    _compileMetaSchema(b) {
      const F = this.opts;
      this.opts = this._metaOpts;
      try {
        c.compileSchema.call(this, b);
      } finally {
        this.opts = F;
      }
    }
  }
  t.default = A, A.ValidationError = n.default, A.MissingRefError = s.default;
  function q(L, b, F, T = "error") {
    for (const o in L) {
      const h = o;
      h in b && this.logger[T](`${F}: option ${o}. ${L[h]}`);
    }
  }
  function S(L) {
    return L = (0, u.normalizeId)(L), this.schemas[L] || this.refs[L];
  }
  function k() {
    const L = this.opts.schemas;
    if (L)
      if (Array.isArray(L))
        this.addSchema(L);
      else
        for (const b in L)
          this.addSchema(L[b], b);
  }
  function M() {
    for (const L in this.opts.formats) {
      const b = this.opts.formats[L];
      b && this.addFormat(L, b);
    }
  }
  function G(L) {
    if (Array.isArray(L)) {
      this.addVocabulary(L);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const b in L) {
      const F = L[b];
      F.keyword || (F.keyword = b), this.addKeyword(F);
    }
  }
  function Y() {
    const L = { ...this.opts };
    for (const b of _)
      delete L[b];
    return L;
  }
  const oe = { log() {
  }, warn() {
  }, error() {
  } };
  function x(L) {
    if (L === !1)
      return oe;
    if (L === void 0)
      return console;
    if (L.log && L.warn && L.error)
      return L;
    throw new Error("logger must implement log, warn and error methods");
  }
  const ae = /^[a-z_$][a-z0-9_$:-]*$/i;
  function se(L, b) {
    const { RULES: F } = this;
    if ((0, f.eachItem)(L, (T) => {
      if (F.keywords[T])
        throw new Error(`Keyword ${T} is already defined`);
      if (!ae.test(T))
        throw new Error(`Keyword ${T} has invalid name`);
    }), !!b && b.$data && !("code" in b || "validate" in b))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function Ie(L, b, F) {
    var T;
    const o = b?.post;
    if (F && o)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: h } = this;
    let I = o ? h.post : h.rules.find(({ type: z }) => z === F);
    if (I || (I = { type: F, rules: [] }, h.rules.push(I)), h.keywords[L] = !0, !b)
      return;
    const V = {
      keyword: L,
      definition: {
        ...b,
        type: (0, d.getJSONTypes)(b.type),
        schemaType: (0, d.getJSONTypes)(b.schemaType)
      }
    };
    b.before ? Ve.call(this, I, V, b.before) : I.rules.push(V), h.all[L] = V, (T = b.implements) === null || T === void 0 || T.forEach((z) => this.addKeyword(z));
  }
  function Ve(L, b, F) {
    const T = L.rules.findIndex((o) => o.keyword === F);
    T >= 0 ? L.rules.splice(T, 0, b) : (L.rules.push(b), this.logger.warn(`rule ${F} is not defined`));
  }
  function Be(L) {
    let { metaSchema: b } = L;
    b !== void 0 && (L.$data && this.opts.$data && (b = Qe(b)), L.validateSchema = this.compile(b, !0));
  }
  const st = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function Qe(L) {
    return { anyOf: [L, st] };
  }
})(Rs);
var Kr = {}, Wr = {}, Gr = {};
Object.defineProperty(Gr, "__esModule", { value: !0 });
const aa = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
Gr.default = aa;
var ht = {};
Object.defineProperty(ht, "__esModule", { value: !0 });
ht.callRef = ht.getValidate = void 0;
const ca = Vr(), rs = X, Re = ee, _t = Ge, ns = Ne, Zt = ne, la = {
  keyword: "$ref",
  schemaType: "string",
  code(t) {
    const { gen: e, schema: r, it: n } = t, { baseId: s, schemaEnv: i, validateName: c, opts: a, self: u } = n, { root: d } = i;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return g();
    const f = ns.resolveRef.call(u, d, s, r);
    if (f === void 0)
      throw new ca.default(n.opts.uriResolver, s, r);
    if (f instanceof ns.SchemaEnv)
      return R(f);
    return E(f);
    function g() {
      if (i === d)
        return sr(t, c, i, i.$async);
      const _ = e.scopeValue("root", { ref: d });
      return sr(t, (0, Re._)`${_}.validate`, d, d.$async);
    }
    function R(_) {
      const w = qs(t, _);
      sr(t, w, _, _.$async);
    }
    function E(_) {
      const w = e.scopeValue("schema", a.code.source === !0 ? { ref: _, code: (0, Re.stringify)(_) } : { ref: _ }), $ = e.name("valid"), y = t.subschema({
        schema: _,
        dataTypes: [],
        schemaPath: Re.nil,
        topSchemaRef: w,
        errSchemaPath: r
      }, $);
      t.mergeEvaluated(y), t.ok($);
    }
  }
};
function qs(t, e) {
  const { gen: r } = t;
  return e.validate ? r.scopeValue("validate", { ref: e.validate }) : (0, Re._)`${r.scopeValue("wrapper", { ref: e })}.validate`;
}
ht.getValidate = qs;
function sr(t, e, r, n) {
  const { gen: s, it: i } = t, { allErrors: c, schemaEnv: a, opts: u } = i, d = u.passContext ? _t.default.this : Re.nil;
  n ? f() : g();
  function f() {
    if (!a.$async)
      throw new Error("async schema referenced by sync schema");
    const _ = s.let("valid");
    s.try(() => {
      s.code((0, Re._)`await ${(0, rs.callValidateCode)(t, e, d)}`), E(e), c || s.assign(_, !0);
    }, (w) => {
      s.if((0, Re._)`!(${w} instanceof ${i.ValidationError})`, () => s.throw(w)), R(w), c || s.assign(_, !1);
    }), t.ok(_);
  }
  function g() {
    t.result((0, rs.callValidateCode)(t, e, d), () => E(e), () => R(e));
  }
  function R(_) {
    const w = (0, Re._)`${_}.errors`;
    s.assign(_t.default.vErrors, (0, Re._)`${_t.default.vErrors} === null ? ${w} : ${_t.default.vErrors}.concat(${w})`), s.assign(_t.default.errors, (0, Re._)`${_t.default.vErrors}.length`);
  }
  function E(_) {
    var w;
    if (!i.opts.unevaluated)
      return;
    const $ = (w = r?.validate) === null || w === void 0 ? void 0 : w.evaluated;
    if (i.props !== !0)
      if ($ && !$.dynamicProps)
        $.props !== void 0 && (i.props = Zt.mergeEvaluated.props(s, $.props, i.props));
      else {
        const y = s.var("props", (0, Re._)`${_}.evaluated.props`);
        i.props = Zt.mergeEvaluated.props(s, y, i.props, Re.Name);
      }
    if (i.items !== !0)
      if ($ && !$.dynamicItems)
        $.items !== void 0 && (i.items = Zt.mergeEvaluated.items(s, $.items, i.items));
      else {
        const y = s.var("items", (0, Re._)`${_}.evaluated.items`);
        i.items = Zt.mergeEvaluated.items(s, y, i.items, Re.Name);
      }
  }
}
ht.callRef = sr;
ht.default = la;
Object.defineProperty(Wr, "__esModule", { value: !0 });
const ua = Gr, da = ht, fa = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  ua.default,
  da.default
];
Wr.default = fa;
var Br = {}, Jr = {};
Object.defineProperty(Jr, "__esModule", { value: !0 });
const ar = ee, rt = ar.operators, cr = {
  maximum: { okStr: "<=", ok: rt.LTE, fail: rt.GT },
  minimum: { okStr: ">=", ok: rt.GTE, fail: rt.LT },
  exclusiveMaximum: { okStr: "<", ok: rt.LT, fail: rt.GTE },
  exclusiveMinimum: { okStr: ">", ok: rt.GT, fail: rt.LTE }
}, pa = {
  message: ({ keyword: t, schemaCode: e }) => (0, ar.str)`must be ${cr[t].okStr} ${e}`,
  params: ({ keyword: t, schemaCode: e }) => (0, ar._)`{comparison: ${cr[t].okStr}, limit: ${e}}`
}, ha = {
  keyword: Object.keys(cr),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: pa,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t;
    t.fail$data((0, ar._)`${r} ${cr[e].fail} ${n} || isNaN(${r})`);
  }
};
Jr.default = ha;
var Yr = {};
Object.defineProperty(Yr, "__esModule", { value: !0 });
const Mt = ee, ma = {
  message: ({ schemaCode: t }) => (0, Mt.str)`must be multiple of ${t}`,
  params: ({ schemaCode: t }) => (0, Mt._)`{multipleOf: ${t}}`
}, ya = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: ma,
  code(t) {
    const { gen: e, data: r, schemaCode: n, it: s } = t, i = s.opts.multipleOfPrecision, c = e.let("res"), a = i ? (0, Mt._)`Math.abs(Math.round(${c}) - ${c}) > 1e-${i}` : (0, Mt._)`${c} !== parseInt(${c})`;
    t.fail$data((0, Mt._)`(${n} === 0 || (${c} = ${r}/${n}, ${a}))`);
  }
};
Yr.default = ya;
var xr = {}, Zr = {};
Object.defineProperty(Zr, "__esModule", { value: !0 });
function Us(t) {
  const e = t.length;
  let r = 0, n = 0, s;
  for (; n < e; )
    r++, s = t.charCodeAt(n++), s >= 55296 && s <= 56319 && n < e && (s = t.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Zr.default = Us;
Us.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(xr, "__esModule", { value: !0 });
const dt = ee, ga = ne, va = Zr, $a = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxLength" ? "more" : "fewer";
    return (0, dt.str)`must NOT have ${r} than ${e} characters`;
  },
  params: ({ schemaCode: t }) => (0, dt._)`{limit: ${t}}`
}, _a = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: $a,
  code(t) {
    const { keyword: e, data: r, schemaCode: n, it: s } = t, i = e === "maxLength" ? dt.operators.GT : dt.operators.LT, c = s.opts.unicode === !1 ? (0, dt._)`${r}.length` : (0, dt._)`${(0, ga.useFunc)(t.gen, va.default)}(${r})`;
    t.fail$data((0, dt._)`${c} ${i} ${n}`);
  }
};
xr.default = _a;
var Qr = {};
Object.defineProperty(Qr, "__esModule", { value: !0 });
const wa = X, lr = ee, ba = {
  message: ({ schemaCode: t }) => (0, lr.str)`must match pattern "${t}"`,
  params: ({ schemaCode: t }) => (0, lr._)`{pattern: ${t}}`
}, Pa = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: ba,
  code(t) {
    const { data: e, $data: r, schema: n, schemaCode: s, it: i } = t, c = i.opts.unicodeRegExp ? "u" : "", a = r ? (0, lr._)`(new RegExp(${s}, ${c}))` : (0, wa.usePattern)(t, n);
    t.fail$data((0, lr._)`!${a}.test(${e})`);
  }
};
Qr.default = Pa;
var Xr = {};
Object.defineProperty(Xr, "__esModule", { value: !0 });
const qt = ee, Ea = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxProperties" ? "more" : "fewer";
    return (0, qt.str)`must NOT have ${r} than ${e} properties`;
  },
  params: ({ schemaCode: t }) => (0, qt._)`{limit: ${t}}`
}, Sa = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: Ea,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t, s = e === "maxProperties" ? qt.operators.GT : qt.operators.LT;
    t.fail$data((0, qt._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Xr.default = Sa;
var en = {};
Object.defineProperty(en, "__esModule", { value: !0 });
const At = X, Ut = ee, Ta = ne, Ra = {
  message: ({ params: { missingProperty: t } }) => (0, Ut.str)`must have required property '${t}'`,
  params: ({ params: { missingProperty: t } }) => (0, Ut._)`{missingProperty: ${t}}`
}, Na = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Ra,
  code(t) {
    const { gen: e, schema: r, schemaCode: n, data: s, $data: i, it: c } = t, { opts: a } = c;
    if (!i && r.length === 0)
      return;
    const u = r.length >= a.loopRequired;
    if (c.allErrors ? d() : f(), a.strictRequired) {
      const E = t.parentSchema.properties, { definedProperties: _ } = t.it;
      for (const w of r)
        if (E?.[w] === void 0 && !_.has(w)) {
          const $ = c.schemaEnv.baseId + c.errSchemaPath, y = `required property "${w}" is not defined at "${$}" (strictRequired)`;
          (0, Ta.checkStrictMode)(c, y, c.opts.strictRequired);
        }
    }
    function d() {
      if (u || i)
        t.block$data(Ut.nil, g);
      else
        for (const E of r)
          (0, At.checkReportMissingProp)(t, E);
    }
    function f() {
      const E = e.let("missing");
      if (u || i) {
        const _ = e.let("valid", !0);
        t.block$data(_, () => R(E, _)), t.ok(_);
      } else
        e.if((0, At.checkMissingProp)(t, r, E)), (0, At.reportMissingProp)(t, E), e.else();
    }
    function g() {
      e.forOf("prop", n, (E) => {
        t.setParams({ missingProperty: E }), e.if((0, At.noPropertyInData)(e, s, E, a.ownProperties), () => t.error());
      });
    }
    function R(E, _) {
      t.setParams({ missingProperty: E }), e.forOf(E, n, () => {
        e.assign(_, (0, At.propertyInData)(e, s, E, a.ownProperties)), e.if((0, Ut.not)(_), () => {
          t.error(), e.break();
        });
      }, Ut.nil);
    }
  }
};
en.default = Na;
var tn = {};
Object.defineProperty(tn, "__esModule", { value: !0 });
const Lt = ee, Oa = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxItems" ? "more" : "fewer";
    return (0, Lt.str)`must NOT have ${r} than ${e} items`;
  },
  params: ({ schemaCode: t }) => (0, Lt._)`{limit: ${t}}`
}, Ca = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: Oa,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t, s = e === "maxItems" ? Lt.operators.GT : Lt.operators.LT;
    t.fail$data((0, Lt._)`${r}.length ${s} ${n}`);
  }
};
tn.default = Ca;
var rn = {}, Kt = {};
Object.defineProperty(Kt, "__esModule", { value: !0 });
const Ls = js;
Ls.code = 'require("ajv/dist/runtime/equal").default';
Kt.default = Ls;
Object.defineProperty(rn, "__esModule", { value: !0 });
const $r = zt, be = ee, ja = ne, ka = Kt, Ia = {
  message: ({ params: { i: t, j: e } }) => (0, be.str)`must NOT have duplicate items (items ## ${e} and ${t} are identical)`,
  params: ({ params: { i: t, j: e } }) => (0, be._)`{i: ${t}, j: ${e}}`
}, Aa = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: Ia,
  code(t) {
    const { gen: e, data: r, $data: n, schema: s, parentSchema: i, schemaCode: c, it: a } = t;
    if (!n && !s)
      return;
    const u = e.let("valid"), d = i.items ? (0, $r.getSchemaTypes)(i.items) : [];
    t.block$data(u, f, (0, be._)`${c} === false`), t.ok(u);
    function f() {
      const _ = e.let("i", (0, be._)`${r}.length`), w = e.let("j");
      t.setParams({ i: _, j: w }), e.assign(u, !0), e.if((0, be._)`${_} > 1`, () => (g() ? R : E)(_, w));
    }
    function g() {
      return d.length > 0 && !d.some((_) => _ === "object" || _ === "array");
    }
    function R(_, w) {
      const $ = e.name("item"), y = (0, $r.checkDataTypes)(d, $, a.opts.strictNumbers, $r.DataType.Wrong), j = e.const("indices", (0, be._)`{}`);
      e.for((0, be._)`;${_}--;`, () => {
        e.let($, (0, be._)`${r}[${_}]`), e.if(y, (0, be._)`continue`), d.length > 1 && e.if((0, be._)`typeof ${$} == "string"`, (0, be._)`${$} += "_"`), e.if((0, be._)`typeof ${j}[${$}] == "number"`, () => {
          e.assign(w, (0, be._)`${j}[${$}]`), t.error(), e.assign(u, !1).break();
        }).code((0, be._)`${j}[${$}] = ${_}`);
      });
    }
    function E(_, w) {
      const $ = (0, ja.useFunc)(e, ka.default), y = e.name("outer");
      e.label(y).for((0, be._)`;${_}--;`, () => e.for((0, be._)`${w} = ${_}; ${w}--;`, () => e.if((0, be._)`${$}(${r}[${_}], ${r}[${w}])`, () => {
        t.error(), e.assign(u, !1).break(y);
      })));
    }
  }
};
rn.default = Aa;
var nn = {};
Object.defineProperty(nn, "__esModule", { value: !0 });
const Tr = ee, Da = ne, Fa = Kt, Ma = {
  message: "must be equal to constant",
  params: ({ schemaCode: t }) => (0, Tr._)`{allowedValue: ${t}}`
}, qa = {
  keyword: "const",
  $data: !0,
  error: Ma,
  code(t) {
    const { gen: e, data: r, $data: n, schemaCode: s, schema: i } = t;
    n || i && typeof i == "object" ? t.fail$data((0, Tr._)`!${(0, Da.useFunc)(e, Fa.default)}(${r}, ${s})`) : t.fail((0, Tr._)`${i} !== ${r}`);
  }
};
nn.default = qa;
var sn = {};
Object.defineProperty(sn, "__esModule", { value: !0 });
const Dt = ee, Ua = ne, La = Kt, Va = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: t }) => (0, Dt._)`{allowedValues: ${t}}`
}, za = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: Va,
  code(t) {
    const { gen: e, data: r, $data: n, schema: s, schemaCode: i, it: c } = t;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const a = s.length >= c.opts.loopEnum;
    let u;
    const d = () => u ?? (u = (0, Ua.useFunc)(e, La.default));
    let f;
    if (a || n)
      f = e.let("valid"), t.block$data(f, g);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const E = e.const("vSchema", i);
      f = (0, Dt.or)(...s.map((_, w) => R(E, w)));
    }
    t.pass(f);
    function g() {
      e.assign(f, !1), e.forOf("v", i, (E) => e.if((0, Dt._)`${d()}(${r}, ${E})`, () => e.assign(f, !0).break()));
    }
    function R(E, _) {
      const w = s[_];
      return typeof w == "object" && w !== null ? (0, Dt._)`${d()}(${r}, ${E}[${_}])` : (0, Dt._)`${r} === ${w}`;
    }
  }
};
sn.default = za;
Object.defineProperty(Br, "__esModule", { value: !0 });
const Ha = Jr, Ka = Yr, Wa = xr, Ga = Qr, Ba = Xr, Ja = en, Ya = tn, xa = rn, Za = nn, Qa = sn, Xa = [
  // number
  Ha.default,
  Ka.default,
  // string
  Wa.default,
  Ga.default,
  // object
  Ba.default,
  Ja.default,
  // array
  Ya.default,
  xa.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Za.default,
  Qa.default
];
Br.default = Xa;
var on = {}, Tt = {};
Object.defineProperty(Tt, "__esModule", { value: !0 });
Tt.validateAdditionalItems = void 0;
const ft = ee, Rr = ne, ec = {
  message: ({ params: { len: t } }) => (0, ft.str)`must NOT have more than ${t} items`,
  params: ({ params: { len: t } }) => (0, ft._)`{limit: ${t}}`
}, tc = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: ec,
  code(t) {
    const { parentSchema: e, it: r } = t, { items: n } = e;
    if (!Array.isArray(n)) {
      (0, Rr.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Vs(t, n);
  }
};
function Vs(t, e) {
  const { gen: r, schema: n, data: s, keyword: i, it: c } = t;
  c.items = !0;
  const a = r.const("len", (0, ft._)`${s}.length`);
  if (n === !1)
    t.setParams({ len: e.length }), t.pass((0, ft._)`${a} <= ${e.length}`);
  else if (typeof n == "object" && !(0, Rr.alwaysValidSchema)(c, n)) {
    const d = r.var("valid", (0, ft._)`${a} <= ${e.length}`);
    r.if((0, ft.not)(d), () => u(d)), t.ok(d);
  }
  function u(d) {
    r.forRange("i", e.length, a, (f) => {
      t.subschema({ keyword: i, dataProp: f, dataPropType: Rr.Type.Num }, d), c.allErrors || r.if((0, ft.not)(d), () => r.break());
    });
  }
}
Tt.validateAdditionalItems = Vs;
Tt.default = tc;
var an = {}, Rt = {};
Object.defineProperty(Rt, "__esModule", { value: !0 });
Rt.validateTuple = void 0;
const ss = ee, ir = ne, rc = X, nc = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(t) {
    const { schema: e, it: r } = t;
    if (Array.isArray(e))
      return zs(t, "additionalItems", e);
    r.items = !0, !(0, ir.alwaysValidSchema)(r, e) && t.ok((0, rc.validateArray)(t));
  }
};
function zs(t, e, r = t.schema) {
  const { gen: n, parentSchema: s, data: i, keyword: c, it: a } = t;
  f(s), a.opts.unevaluated && r.length && a.items !== !0 && (a.items = ir.mergeEvaluated.items(n, r.length, a.items));
  const u = n.name("valid"), d = n.const("len", (0, ss._)`${i}.length`);
  r.forEach((g, R) => {
    (0, ir.alwaysValidSchema)(a, g) || (n.if((0, ss._)`${d} > ${R}`, () => t.subschema({
      keyword: c,
      schemaProp: R,
      dataProp: R
    }, u)), t.ok(u));
  });
  function f(g) {
    const { opts: R, errSchemaPath: E } = a, _ = r.length, w = _ === g.minItems && (_ === g.maxItems || g[e] === !1);
    if (R.strictTuples && !w) {
      const $ = `"${c}" is ${_}-tuple, but minItems or maxItems/${e} are not specified or different at path "${E}"`;
      (0, ir.checkStrictMode)(a, $, R.strictTuples);
    }
  }
}
Rt.validateTuple = zs;
Rt.default = nc;
Object.defineProperty(an, "__esModule", { value: !0 });
const sc = Rt, ic = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (t) => (0, sc.validateTuple)(t, "items")
};
an.default = ic;
var cn = {};
Object.defineProperty(cn, "__esModule", { value: !0 });
const is = ee, oc = ne, ac = X, cc = Tt, lc = {
  message: ({ params: { len: t } }) => (0, is.str)`must NOT have more than ${t} items`,
  params: ({ params: { len: t } }) => (0, is._)`{limit: ${t}}`
}, uc = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: lc,
  code(t) {
    const { schema: e, parentSchema: r, it: n } = t, { prefixItems: s } = r;
    n.items = !0, !(0, oc.alwaysValidSchema)(n, e) && (s ? (0, cc.validateAdditionalItems)(t, s) : t.ok((0, ac.validateArray)(t)));
  }
};
cn.default = uc;
var ln = {};
Object.defineProperty(ln, "__esModule", { value: !0 });
const ke = ee, Qt = ne, dc = {
  message: ({ params: { min: t, max: e } }) => e === void 0 ? (0, ke.str)`must contain at least ${t} valid item(s)` : (0, ke.str)`must contain at least ${t} and no more than ${e} valid item(s)`,
  params: ({ params: { min: t, max: e } }) => e === void 0 ? (0, ke._)`{minContains: ${t}}` : (0, ke._)`{minContains: ${t}, maxContains: ${e}}`
}, fc = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: dc,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, it: i } = t;
    let c, a;
    const { minContains: u, maxContains: d } = n;
    i.opts.next ? (c = u === void 0 ? 1 : u, a = d) : c = 1;
    const f = e.const("len", (0, ke._)`${s}.length`);
    if (t.setParams({ min: c, max: a }), a === void 0 && c === 0) {
      (0, Qt.checkStrictMode)(i, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (a !== void 0 && c > a) {
      (0, Qt.checkStrictMode)(i, '"minContains" > "maxContains" is always invalid'), t.fail();
      return;
    }
    if ((0, Qt.alwaysValidSchema)(i, r)) {
      let w = (0, ke._)`${f} >= ${c}`;
      a !== void 0 && (w = (0, ke._)`${w} && ${f} <= ${a}`), t.pass(w);
      return;
    }
    i.items = !0;
    const g = e.name("valid");
    a === void 0 && c === 1 ? E(g, () => e.if(g, () => e.break())) : c === 0 ? (e.let(g, !0), a !== void 0 && e.if((0, ke._)`${s}.length > 0`, R)) : (e.let(g, !1), R()), t.result(g, () => t.reset());
    function R() {
      const w = e.name("_valid"), $ = e.let("count", 0);
      E(w, () => e.if(w, () => _($)));
    }
    function E(w, $) {
      e.forRange("i", 0, f, (y) => {
        t.subschema({
          keyword: "contains",
          dataProp: y,
          dataPropType: Qt.Type.Num,
          compositeRule: !0
        }, w), $();
      });
    }
    function _(w) {
      e.code((0, ke._)`${w}++`), a === void 0 ? e.if((0, ke._)`${w} >= ${c}`, () => e.assign(g, !0).break()) : (e.if((0, ke._)`${w} > ${a}`, () => e.assign(g, !1).break()), c === 1 ? e.assign(g, !0) : e.if((0, ke._)`${w} >= ${c}`, () => e.assign(g, !0)));
    }
  }
};
ln.default = fc;
var Hs = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.validateSchemaDeps = t.validatePropertyDeps = t.error = void 0;
  const e = ee, r = ne, n = X;
  t.error = {
    message: ({ params: { property: u, depsCount: d, deps: f } }) => {
      const g = d === 1 ? "property" : "properties";
      return (0, e.str)`must have ${g} ${f} when property ${u} is present`;
    },
    params: ({ params: { property: u, depsCount: d, deps: f, missingProperty: g } }) => (0, e._)`{property: ${u},
    missingProperty: ${g},
    depsCount: ${d},
    deps: ${f}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: t.error,
    code(u) {
      const [d, f] = i(u);
      c(u, d), a(u, f);
    }
  };
  function i({ schema: u }) {
    const d = {}, f = {};
    for (const g in u) {
      if (g === "__proto__")
        continue;
      const R = Array.isArray(u[g]) ? d : f;
      R[g] = u[g];
    }
    return [d, f];
  }
  function c(u, d = u.schema) {
    const { gen: f, data: g, it: R } = u;
    if (Object.keys(d).length === 0)
      return;
    const E = f.let("missing");
    for (const _ in d) {
      const w = d[_];
      if (w.length === 0)
        continue;
      const $ = (0, n.propertyInData)(f, g, _, R.opts.ownProperties);
      u.setParams({
        property: _,
        depsCount: w.length,
        deps: w.join(", ")
      }), R.allErrors ? f.if($, () => {
        for (const y of w)
          (0, n.checkReportMissingProp)(u, y);
      }) : (f.if((0, e._)`${$} && (${(0, n.checkMissingProp)(u, w, E)})`), (0, n.reportMissingProp)(u, E), f.else());
    }
  }
  t.validatePropertyDeps = c;
  function a(u, d = u.schema) {
    const { gen: f, data: g, keyword: R, it: E } = u, _ = f.name("valid");
    for (const w in d)
      (0, r.alwaysValidSchema)(E, d[w]) || (f.if(
        (0, n.propertyInData)(f, g, w, E.opts.ownProperties),
        () => {
          const $ = u.subschema({ keyword: R, schemaProp: w }, _);
          u.mergeValidEvaluated($, _);
        },
        () => f.var(_, !0)
        // TODO var
      ), u.ok(_));
  }
  t.validateSchemaDeps = a, t.default = s;
})(Hs);
var un = {};
Object.defineProperty(un, "__esModule", { value: !0 });
const Ks = ee, pc = ne, hc = {
  message: "property name must be valid",
  params: ({ params: t }) => (0, Ks._)`{propertyName: ${t.propertyName}}`
}, mc = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: hc,
  code(t) {
    const { gen: e, schema: r, data: n, it: s } = t;
    if ((0, pc.alwaysValidSchema)(s, r))
      return;
    const i = e.name("valid");
    e.forIn("key", n, (c) => {
      t.setParams({ propertyName: c }), t.subschema({
        keyword: "propertyNames",
        data: c,
        dataTypes: ["string"],
        propertyName: c,
        compositeRule: !0
      }, i), e.if((0, Ks.not)(i), () => {
        t.error(!0), s.allErrors || e.break();
      });
    }), t.ok(i);
  }
};
un.default = mc;
var mr = {};
Object.defineProperty(mr, "__esModule", { value: !0 });
const Xt = X, Fe = ee, yc = Ge, er = ne, gc = {
  message: "must NOT have additional properties",
  params: ({ params: t }) => (0, Fe._)`{additionalProperty: ${t.additionalProperty}}`
}, vc = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: gc,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, errsCount: i, it: c } = t;
    if (!i)
      throw new Error("ajv implementation error");
    const { allErrors: a, opts: u } = c;
    if (c.props = !0, u.removeAdditional !== "all" && (0, er.alwaysValidSchema)(c, r))
      return;
    const d = (0, Xt.allSchemaProperties)(n.properties), f = (0, Xt.allSchemaProperties)(n.patternProperties);
    g(), t.ok((0, Fe._)`${i} === ${yc.default.errors}`);
    function g() {
      e.forIn("key", s, ($) => {
        !d.length && !f.length ? _($) : e.if(R($), () => _($));
      });
    }
    function R($) {
      let y;
      if (d.length > 8) {
        const j = (0, er.schemaRefOrVal)(c, n.properties, "properties");
        y = (0, Xt.isOwnProperty)(e, j, $);
      } else
        d.length ? y = (0, Fe.or)(...d.map((j) => (0, Fe._)`${$} === ${j}`)) : y = Fe.nil;
      return f.length && (y = (0, Fe.or)(y, ...f.map((j) => (0, Fe._)`${(0, Xt.usePattern)(t, j)}.test(${$})`))), (0, Fe.not)(y);
    }
    function E($) {
      e.code((0, Fe._)`delete ${s}[${$}]`);
    }
    function _($) {
      if (u.removeAdditional === "all" || u.removeAdditional && r === !1) {
        E($);
        return;
      }
      if (r === !1) {
        t.setParams({ additionalProperty: $ }), t.error(), a || e.break();
        return;
      }
      if (typeof r == "object" && !(0, er.alwaysValidSchema)(c, r)) {
        const y = e.name("valid");
        u.removeAdditional === "failing" ? (w($, y, !1), e.if((0, Fe.not)(y), () => {
          t.reset(), E($);
        })) : (w($, y), a || e.if((0, Fe.not)(y), () => e.break()));
      }
    }
    function w($, y, j) {
      const O = {
        keyword: "additionalProperties",
        dataProp: $,
        dataPropType: er.Type.Str
      };
      j === !1 && Object.assign(O, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), t.subschema(O, y);
    }
  }
};
mr.default = vc;
var dn = {};
Object.defineProperty(dn, "__esModule", { value: !0 });
const $c = fr(), os = X, _r = ne, as = mr, _c = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, it: i } = t;
    i.opts.removeAdditional === "all" && n.additionalProperties === void 0 && as.default.code(new $c.KeywordCxt(i, as.default, "additionalProperties"));
    const c = (0, os.allSchemaProperties)(r);
    for (const g of c)
      i.definedProperties.add(g);
    i.opts.unevaluated && c.length && i.props !== !0 && (i.props = _r.mergeEvaluated.props(e, (0, _r.toHash)(c), i.props));
    const a = c.filter((g) => !(0, _r.alwaysValidSchema)(i, r[g]));
    if (a.length === 0)
      return;
    const u = e.name("valid");
    for (const g of a)
      d(g) ? f(g) : (e.if((0, os.propertyInData)(e, s, g, i.opts.ownProperties)), f(g), i.allErrors || e.else().var(u, !0), e.endIf()), t.it.definedProperties.add(g), t.ok(u);
    function d(g) {
      return i.opts.useDefaults && !i.compositeRule && r[g].default !== void 0;
    }
    function f(g) {
      t.subschema({
        keyword: "properties",
        schemaProp: g,
        dataProp: g
      }, u);
    }
  }
};
dn.default = _c;
var fn = {};
Object.defineProperty(fn, "__esModule", { value: !0 });
const cs = X, tr = ee, ls = ne, us = ne, wc = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(t) {
    const { gen: e, schema: r, data: n, parentSchema: s, it: i } = t, { opts: c } = i, a = (0, cs.allSchemaProperties)(r), u = a.filter((w) => (0, ls.alwaysValidSchema)(i, r[w]));
    if (a.length === 0 || u.length === a.length && (!i.opts.unevaluated || i.props === !0))
      return;
    const d = c.strictSchema && !c.allowMatchingProperties && s.properties, f = e.name("valid");
    i.props !== !0 && !(i.props instanceof tr.Name) && (i.props = (0, us.evaluatedPropsToName)(e, i.props));
    const { props: g } = i;
    R();
    function R() {
      for (const w of a)
        d && E(w), i.allErrors ? _(w) : (e.var(f, !0), _(w), e.if(f));
    }
    function E(w) {
      for (const $ in d)
        new RegExp(w).test($) && (0, ls.checkStrictMode)(i, `property ${$} matches pattern ${w} (use allowMatchingProperties)`);
    }
    function _(w) {
      e.forIn("key", n, ($) => {
        e.if((0, tr._)`${(0, cs.usePattern)(t, w)}.test(${$})`, () => {
          const y = u.includes(w);
          y || t.subschema({
            keyword: "patternProperties",
            schemaProp: w,
            dataProp: $,
            dataPropType: us.Type.Str
          }, f), i.opts.unevaluated && g !== !0 ? e.assign((0, tr._)`${g}[${$}]`, !0) : !y && !i.allErrors && e.if((0, tr.not)(f), () => e.break());
        });
      });
    }
  }
};
fn.default = wc;
var pn = {};
Object.defineProperty(pn, "__esModule", { value: !0 });
const bc = ne, Pc = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(t) {
    const { gen: e, schema: r, it: n } = t;
    if ((0, bc.alwaysValidSchema)(n, r)) {
      t.fail();
      return;
    }
    const s = e.name("valid");
    t.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), t.failResult(s, () => t.reset(), () => t.error());
  },
  error: { message: "must NOT be valid" }
};
pn.default = Pc;
var hn = {};
Object.defineProperty(hn, "__esModule", { value: !0 });
const Ec = X, Sc = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Ec.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
hn.default = Sc;
var mn = {};
Object.defineProperty(mn, "__esModule", { value: !0 });
const or = ee, Tc = ne, Rc = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: t }) => (0, or._)`{passingSchemas: ${t.passing}}`
}, Nc = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Rc,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, it: s } = t;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const i = r, c = e.let("valid", !1), a = e.let("passing", null), u = e.name("_valid");
    t.setParams({ passing: a }), e.block(d), t.result(c, () => t.reset(), () => t.error(!0));
    function d() {
      i.forEach((f, g) => {
        let R;
        (0, Tc.alwaysValidSchema)(s, f) ? e.var(u, !0) : R = t.subschema({
          keyword: "oneOf",
          schemaProp: g,
          compositeRule: !0
        }, u), g > 0 && e.if((0, or._)`${u} && ${c}`).assign(c, !1).assign(a, (0, or._)`[${a}, ${g}]`).else(), e.if(u, () => {
          e.assign(c, !0), e.assign(a, g), R && t.mergeEvaluated(R, or.Name);
        });
      });
    }
  }
};
mn.default = Nc;
var yn = {};
Object.defineProperty(yn, "__esModule", { value: !0 });
const Oc = ne, Cc = {
  keyword: "allOf",
  schemaType: "array",
  code(t) {
    const { gen: e, schema: r, it: n } = t;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = e.name("valid");
    r.forEach((i, c) => {
      if ((0, Oc.alwaysValidSchema)(n, i))
        return;
      const a = t.subschema({ keyword: "allOf", schemaProp: c }, s);
      t.ok(s), t.mergeEvaluated(a);
    });
  }
};
yn.default = Cc;
var gn = {};
Object.defineProperty(gn, "__esModule", { value: !0 });
const ur = ee, Ws = ne, jc = {
  message: ({ params: t }) => (0, ur.str)`must match "${t.ifClause}" schema`,
  params: ({ params: t }) => (0, ur._)`{failingKeyword: ${t.ifClause}}`
}, kc = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: jc,
  code(t) {
    const { gen: e, parentSchema: r, it: n } = t;
    r.then === void 0 && r.else === void 0 && (0, Ws.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = ds(n, "then"), i = ds(n, "else");
    if (!s && !i)
      return;
    const c = e.let("valid", !0), a = e.name("_valid");
    if (u(), t.reset(), s && i) {
      const f = e.let("ifClause");
      t.setParams({ ifClause: f }), e.if(a, d("then", f), d("else", f));
    } else
      s ? e.if(a, d("then")) : e.if((0, ur.not)(a), d("else"));
    t.pass(c, () => t.error(!0));
    function u() {
      const f = t.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, a);
      t.mergeEvaluated(f);
    }
    function d(f, g) {
      return () => {
        const R = t.subschema({ keyword: f }, a);
        e.assign(c, a), t.mergeValidEvaluated(R, c), g ? e.assign(g, (0, ur._)`${f}`) : t.setParams({ ifClause: f });
      };
    }
  }
};
function ds(t, e) {
  const r = t.schema[e];
  return r !== void 0 && !(0, Ws.alwaysValidSchema)(t, r);
}
gn.default = kc;
var vn = {};
Object.defineProperty(vn, "__esModule", { value: !0 });
const Ic = ne, Ac = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: t, parentSchema: e, it: r }) {
    e.if === void 0 && (0, Ic.checkStrictMode)(r, `"${t}" without "if" is ignored`);
  }
};
vn.default = Ac;
Object.defineProperty(on, "__esModule", { value: !0 });
const Dc = Tt, Fc = an, Mc = Rt, qc = cn, Uc = ln, Lc = Hs, Vc = un, zc = mr, Hc = dn, Kc = fn, Wc = pn, Gc = hn, Bc = mn, Jc = yn, Yc = gn, xc = vn;
function Zc(t = !1) {
  const e = [
    // any
    Wc.default,
    Gc.default,
    Bc.default,
    Jc.default,
    Yc.default,
    xc.default,
    // object
    Vc.default,
    zc.default,
    Lc.default,
    Hc.default,
    Kc.default
  ];
  return t ? e.push(Fc.default, qc.default) : e.push(Dc.default, Mc.default), e.push(Uc.default), e;
}
on.default = Zc;
var $n = {}, _n = {};
Object.defineProperty(_n, "__esModule", { value: !0 });
const ye = ee, Qc = {
  message: ({ schemaCode: t }) => (0, ye.str)`must match format "${t}"`,
  params: ({ schemaCode: t }) => (0, ye._)`{format: ${t}}`
}, Xc = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: Qc,
  code(t, e) {
    const { gen: r, data: n, $data: s, schema: i, schemaCode: c, it: a } = t, { opts: u, errSchemaPath: d, schemaEnv: f, self: g } = a;
    if (!u.validateFormats)
      return;
    s ? R() : E();
    function R() {
      const _ = r.scopeValue("formats", {
        ref: g.formats,
        code: u.code.formats
      }), w = r.const("fDef", (0, ye._)`${_}[${c}]`), $ = r.let("fType"), y = r.let("format");
      r.if((0, ye._)`typeof ${w} == "object" && !(${w} instanceof RegExp)`, () => r.assign($, (0, ye._)`${w}.type || "string"`).assign(y, (0, ye._)`${w}.validate`), () => r.assign($, (0, ye._)`"string"`).assign(y, w)), t.fail$data((0, ye.or)(j(), O()));
      function j() {
        return u.strictSchema === !1 ? ye.nil : (0, ye._)`${c} && !${y}`;
      }
      function O() {
        const A = f.$async ? (0, ye._)`(${w}.async ? await ${y}(${n}) : ${y}(${n}))` : (0, ye._)`${y}(${n})`, q = (0, ye._)`(typeof ${y} == "function" ? ${A} : ${y}.test(${n}))`;
        return (0, ye._)`${y} && ${y} !== true && ${$} === ${e} && !${q}`;
      }
    }
    function E() {
      const _ = g.formats[i];
      if (!_) {
        j();
        return;
      }
      if (_ === !0)
        return;
      const [w, $, y] = O(_);
      w === e && t.pass(A());
      function j() {
        if (u.strictSchema === !1) {
          g.logger.warn(q());
          return;
        }
        throw new Error(q());
        function q() {
          return `unknown format "${i}" ignored in schema at path "${d}"`;
        }
      }
      function O(q) {
        const S = q instanceof RegExp ? (0, ye.regexpCode)(q) : u.code.formats ? (0, ye._)`${u.code.formats}${(0, ye.getProperty)(i)}` : void 0, k = r.scopeValue("formats", { key: i, ref: q, code: S });
        return typeof q == "object" && !(q instanceof RegExp) ? [q.type || "string", q.validate, (0, ye._)`${k}.validate`] : ["string", q, k];
      }
      function A() {
        if (typeof _ == "object" && !(_ instanceof RegExp) && _.async) {
          if (!f.$async)
            throw new Error("async format in sync schema");
          return (0, ye._)`await ${y}(${n})`;
        }
        return typeof $ == "function" ? (0, ye._)`${y}(${n})` : (0, ye._)`${y}.test(${n})`;
      }
    }
  }
};
_n.default = Xc;
Object.defineProperty($n, "__esModule", { value: !0 });
const el = _n, tl = [el.default];
$n.default = tl;
var St = {};
Object.defineProperty(St, "__esModule", { value: !0 });
St.contentVocabulary = St.metadataVocabulary = void 0;
St.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
St.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(Kr, "__esModule", { value: !0 });
const rl = Wr, nl = Br, sl = on, il = $n, fs = St, ol = [
  rl.default,
  nl.default,
  (0, sl.default)(),
  il.default,
  fs.metadataVocabulary,
  fs.contentVocabulary
];
Kr.default = ol;
var wn = {}, Gs = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.DiscrError = void 0, function(e) {
    e.Tag = "tag", e.Mapping = "mapping";
  }(t.DiscrError || (t.DiscrError = {}));
})(Gs);
Object.defineProperty(wn, "__esModule", { value: !0 });
const wt = ee, Nr = Gs, ps = Ne, al = ne, cl = {
  message: ({ params: { discrError: t, tagName: e } }) => t === Nr.DiscrError.Tag ? `tag "${e}" must be string` : `value of tag "${e}" must be in oneOf`,
  params: ({ params: { discrError: t, tag: e, tagName: r } }) => (0, wt._)`{error: ${t}, tag: ${r}, tagValue: ${e}}`
}, ll = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: cl,
  code(t) {
    const { gen: e, data: r, schema: n, parentSchema: s, it: i } = t, { oneOf: c } = s;
    if (!i.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const a = n.propertyName;
    if (typeof a != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!c)
      throw new Error("discriminator: requires oneOf keyword");
    const u = e.let("valid", !1), d = e.const("tag", (0, wt._)`${r}${(0, wt.getProperty)(a)}`);
    e.if((0, wt._)`typeof ${d} == "string"`, () => f(), () => t.error(!1, { discrError: Nr.DiscrError.Tag, tag: d, tagName: a })), t.ok(u);
    function f() {
      const E = R();
      e.if(!1);
      for (const _ in E)
        e.elseIf((0, wt._)`${d} === ${_}`), e.assign(u, g(E[_]));
      e.else(), t.error(!1, { discrError: Nr.DiscrError.Mapping, tag: d, tagName: a }), e.endIf();
    }
    function g(E) {
      const _ = e.name("valid"), w = t.subschema({ keyword: "oneOf", schemaProp: E }, _);
      return t.mergeEvaluated(w, wt.Name), _;
    }
    function R() {
      var E;
      const _ = {}, w = y(s);
      let $ = !0;
      for (let A = 0; A < c.length; A++) {
        let q = c[A];
        q?.$ref && !(0, al.schemaHasRulesButRef)(q, i.self.RULES) && (q = ps.resolveRef.call(i.self, i.schemaEnv.root, i.baseId, q?.$ref), q instanceof ps.SchemaEnv && (q = q.schema));
        const S = (E = q?.properties) === null || E === void 0 ? void 0 : E[a];
        if (typeof S != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${a}"`);
        $ = $ && (w || y(q)), j(S, A);
      }
      if (!$)
        throw new Error(`discriminator: "${a}" must be required`);
      return _;
      function y({ required: A }) {
        return Array.isArray(A) && A.includes(a);
      }
      function j(A, q) {
        if (A.const)
          O(A.const, q);
        else if (A.enum)
          for (const S of A.enum)
            O(S, q);
        else
          throw new Error(`discriminator: "properties/${a}" must have "const" or "enum"`);
      }
      function O(A, q) {
        if (typeof A != "string" || A in _)
          throw new Error(`discriminator: "${a}" values must be unique strings`);
        _[A] = q;
      }
    }
  }
};
wn.default = ll;
const ul = "http://json-schema.org/draft-07/schema#", dl = "http://json-schema.org/draft-07/schema#", fl = "Core schema meta-schema", pl = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $ref: "#"
    }
  },
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    allOf: [
      {
        $ref: "#/definitions/nonNegativeInteger"
      },
      {
        default: 0
      }
    ]
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, hl = [
  "object",
  "boolean"
], ml = {
  $id: {
    type: "string",
    format: "uri-reference"
  },
  $schema: {
    type: "string",
    format: "uri"
  },
  $ref: {
    type: "string",
    format: "uri-reference"
  },
  $comment: {
    type: "string"
  },
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  readOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  additionalItems: {
    $ref: "#"
  },
  items: {
    anyOf: [
      {
        $ref: "#"
      },
      {
        $ref: "#/definitions/schemaArray"
      }
    ],
    default: !0
  },
  maxItems: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  contains: {
    $ref: "#"
  },
  maxProperties: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/definitions/stringArray"
  },
  additionalProperties: {
    $ref: "#"
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependencies: {
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $ref: "#"
        },
        {
          $ref: "#/definitions/stringArray"
        }
      ]
    }
  },
  propertyNames: {
    $ref: "#"
  },
  const: !0,
  enum: {
    type: "array",
    items: !0,
    minItems: 1,
    uniqueItems: !0
  },
  type: {
    anyOf: [
      {
        $ref: "#/definitions/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/definitions/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  format: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentEncoding: {
    type: "string"
  },
  if: {
    $ref: "#"
  },
  then: {
    $ref: "#"
  },
  else: {
    $ref: "#"
  },
  allOf: {
    $ref: "#/definitions/schemaArray"
  },
  anyOf: {
    $ref: "#/definitions/schemaArray"
  },
  oneOf: {
    $ref: "#/definitions/schemaArray"
  },
  not: {
    $ref: "#"
  }
}, yl = {
  $schema: ul,
  $id: dl,
  title: fl,
  definitions: pl,
  type: hl,
  properties: ml,
  default: !0
};
(function(t, e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.MissingRefError = e.ValidationError = e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  const r = Rs, n = Kr, s = wn, i = yl, c = ["/properties"], a = "http://json-schema.org/draft-07/schema";
  class u extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((_) => this.addVocabulary(_)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const _ = this.opts.$data ? this.$dataMetaSchema(i, c) : i;
      this.addMetaSchema(_, a, !1), this.refs["http://json-schema.org/schema"] = a;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(a) ? a : void 0);
    }
  }
  t.exports = e = u, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = u;
  var d = fr();
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var f = ee;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return f._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return f.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return f.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return f.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return f.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return f.CodeGen;
  } });
  var g = Lr();
  Object.defineProperty(e, "ValidationError", { enumerable: !0, get: function() {
    return g.default;
  } });
  var R = Vr();
  Object.defineProperty(e, "MissingRefError", { enumerable: !0, get: function() {
    return R.default;
  } });
})(br, br.exports);
var gl = br.exports;
const vl = /* @__PURE__ */ po(gl), $l = "http://json-schema.org/schema", _l = "#/definitions/Blueprint", wl = {
  Blueprint: {
    type: "object",
    properties: {
      landingPage: {
        type: "string",
        description: "The URL to navigate to after the blueprint has been run."
      },
      preferredVersions: {
        type: "object",
        properties: {
          php: {
            anyOf: [
              {
                $ref: "#/definitions/SupportedPHPVersion"
              },
              {
                type: "string",
                const: "latest"
              }
            ],
            description: "The preferred PHP version to use. If not specified, the latest supported version will be used"
          },
          wp: {
            type: "string",
            description: "The preferred WordPress version to use. If not specified, the latest supported version will be used"
          }
        },
        required: [
          "php",
          "wp"
        ],
        additionalProperties: !1,
        description: "The preferred PHP and WordPress versions to use."
      },
      steps: {
        type: "array",
        items: {
          anyOf: [
            {
              $ref: "#/definitions/StepDefinition"
            },
            {
              type: "string"
            },
            {
              not: {}
            },
            {
              type: "boolean",
              const: !1
            },
            {
              type: "null"
            }
          ]
        },
        description: "The steps to run."
      },
      $schema: {
        type: "string"
      }
    },
    additionalProperties: !1
  },
  SupportedPHPVersion: {
    type: "string",
    enum: [
      "8.2",
      "8.1",
      "8.0",
      "7.4",
      "7.3",
      "7.2",
      "7.1",
      "7.0",
      "5.6"
    ]
  },
  StepDefinition: {
    type: "object",
    discriminator: {
      propertyName: "step"
    },
    required: [
      "step"
    ],
    oneOf: [
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "activatePlugin"
          },
          pluginPath: {
            type: "string",
            description: "Path to the plugin directory as absolute path (/wordpress/wp-content/plugins/plugin-name); or the plugin entry file relative to the plugins directory (plugin-name/plugin-name.php)."
          },
          pluginName: {
            type: "string",
            description: "Optional. Plugin name to display in the progress bar."
          }
        },
        required: [
          "pluginPath",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "activateTheme"
          },
          themeFolderName: {
            type: "string",
            description: "The name of the theme folder inside wp-content/themes/"
          }
        },
        required: [
          "step",
          "themeFolderName"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "applyWordPressPatches"
          },
          siteUrl: {
            type: "string"
          },
          wordpressPath: {
            type: "string"
          },
          addPhpInfo: {
            type: "boolean"
          },
          patchSecrets: {
            type: "boolean"
          },
          disableSiteHealth: {
            type: "boolean"
          },
          disableWpNewBlogNotification: {
            type: "boolean"
          }
        },
        required: [
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "cp"
          },
          fromPath: {
            type: "string",
            description: "Source path"
          },
          toPath: {
            type: "string",
            description: "Target path"
          }
        },
        required: [
          "fromPath",
          "step",
          "toPath"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "defineWpConfigConsts"
          },
          consts: {
            type: "object",
            additionalProperties: {},
            description: "The constants to define"
          },
          virtualize: {
            type: "boolean",
            description: "Enables the virtualization of wp-config.php and playground-consts.json files, leaving the local system files untouched. The variables defined in the /vfs-blueprints/playground-consts.json file are loaded via the auto_prepend_file directive in the php.ini file.",
            default: !1
          }
        },
        required: [
          "consts",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "defineSiteUrl"
          },
          siteUrl: {
            type: "string",
            description: "The URL"
          }
        },
        required: [
          "siteUrl",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "importFile"
          },
          file: {
            $ref: "#/definitions/FileReference",
            description: "The file to import"
          }
        },
        required: [
          "file",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "installPlugin",
            description: "The step identifier."
          },
          pluginZipFile: {
            $ref: "#/definitions/FileReference",
            description: "The plugin zip file to install."
          },
          options: {
            $ref: "#/definitions/InstallPluginOptions",
            description: "Optional installation options."
          }
        },
        required: [
          "pluginZipFile",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "installTheme",
            description: "The step identifier."
          },
          themeZipFile: {
            $ref: "#/definitions/FileReference",
            description: "The theme zip file to install."
          },
          options: {
            type: "object",
            properties: {
              activate: {
                type: "boolean",
                description: "Whether to activate the theme after installing it."
              }
            },
            additionalProperties: !1,
            description: "Optional installation options."
          }
        },
        required: [
          "step",
          "themeZipFile"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "login"
          },
          username: {
            type: "string",
            description: "The user to log in as. Defaults to 'admin'."
          },
          password: {
            type: "string",
            description: "The password to log in with. Defaults to 'password'."
          }
        },
        required: [
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "mkdir"
          },
          path: {
            type: "string",
            description: "The path of the directory you want to create"
          }
        },
        required: [
          "path",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "mv"
          },
          fromPath: {
            type: "string",
            description: "Source path"
          },
          toPath: {
            type: "string",
            description: "Target path"
          }
        },
        required: [
          "fromPath",
          "step",
          "toPath"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "request"
          },
          request: {
            $ref: "#/definitions/PHPRequest",
            description: "Request details (See /wordpress-playground/api/universal/interface/PHPRequest)"
          }
        },
        required: [
          "request",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "replaceSite"
          },
          fullSiteZip: {
            $ref: "#/definitions/FileReference",
            description: "The zip file containing the new WordPress site"
          }
        },
        required: [
          "fullSiteZip",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "rm"
          },
          path: {
            type: "string",
            description: "The path to remove"
          }
        },
        required: [
          "path",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "rmdir"
          },
          path: {
            type: "string",
            description: "The path to remove"
          }
        },
        required: [
          "path",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "runPHP",
            description: "The step identifier."
          },
          code: {
            type: "string",
            description: "The PHP code to run."
          }
        },
        required: [
          "code",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "runPHPWithOptions"
          },
          options: {
            $ref: "#/definitions/PHPRunOptions",
            description: "Run options (See /wordpress-playground/api/universal/interface/PHPRunOptions)"
          }
        },
        required: [
          "options",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "runWpInstallationWizard"
          },
          options: {
            $ref: "#/definitions/WordPressInstallationOptions"
          }
        },
        required: [
          "options",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "setPhpIniEntry"
          },
          key: {
            type: "string",
            description: 'Entry name e.g. "display_errors"'
          },
          value: {
            type: "string",
            description: 'Entry value as a string e.g. "1"'
          }
        },
        required: [
          "key",
          "step",
          "value"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "setSiteOptions",
            description: 'The name of the step. Must be "setSiteOptions".'
          },
          options: {
            type: "object",
            additionalProperties: {},
            description: "The options to set on the site."
          }
        },
        required: [
          "options",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "unzip"
          },
          zipPath: {
            type: "string",
            description: "The zip file to extract"
          },
          extractToPath: {
            type: "string",
            description: "The path to extract the zip file to"
          }
        },
        required: [
          "extractToPath",
          "step",
          "zipPath"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "updateUserMeta"
          },
          meta: {
            type: "object",
            additionalProperties: {},
            description: 'An object of user meta values to set, e.g. { "first_name": "John" }'
          },
          userId: {
            type: "number",
            description: "User ID"
          }
        },
        required: [
          "meta",
          "step",
          "userId"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "writeFile"
          },
          path: {
            type: "string",
            description: "The path of the file to write to"
          },
          data: {
            anyOf: [
              {
                $ref: "#/definitions/FileReference"
              },
              {
                type: "string"
              },
              {
                type: "object",
                properties: {
                  BYTES_PER_ELEMENT: {
                    type: "number"
                  },
                  buffer: {
                    type: "object",
                    properties: {
                      byteLength: {
                        type: "number"
                      }
                    },
                    required: [
                      "byteLength"
                    ],
                    additionalProperties: !1
                  },
                  byteLength: {
                    type: "number"
                  },
                  byteOffset: {
                    type: "number"
                  },
                  length: {
                    type: "number"
                  }
                },
                required: [
                  "BYTES_PER_ELEMENT",
                  "buffer",
                  "byteLength",
                  "byteOffset",
                  "length"
                ],
                additionalProperties: {
                  type: "number"
                }
              }
            ],
            description: "The data to write"
          }
        },
        required: [
          "data",
          "path",
          "step"
        ]
      }
    ]
  },
  FileReference: {
    anyOf: [
      {
        $ref: "#/definitions/VFSReference"
      },
      {
        $ref: "#/definitions/LiteralReference"
      },
      {
        $ref: "#/definitions/CoreThemeReference"
      },
      {
        $ref: "#/definitions/CorePluginReference"
      },
      {
        $ref: "#/definitions/UrlReference"
      }
    ]
  },
  VFSReference: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        const: "vfs",
        description: "Identifies the file resource as Virtual File System (VFS)"
      },
      path: {
        type: "string",
        description: "The path to the file in the VFS"
      }
    },
    required: [
      "resource",
      "path"
    ],
    additionalProperties: !1
  },
  LiteralReference: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        const: "literal",
        description: "Identifies the file resource as a literal file"
      },
      name: {
        type: "string",
        description: "The name of the file"
      },
      contents: {
        anyOf: [
          {
            type: "string"
          },
          {
            type: "object",
            properties: {
              BYTES_PER_ELEMENT: {
                type: "number"
              },
              buffer: {
                type: "object",
                properties: {
                  byteLength: {
                    type: "number"
                  }
                },
                required: [
                  "byteLength"
                ],
                additionalProperties: !1
              },
              byteLength: {
                type: "number"
              },
              byteOffset: {
                type: "number"
              },
              length: {
                type: "number"
              }
            },
            required: [
              "BYTES_PER_ELEMENT",
              "buffer",
              "byteLength",
              "byteOffset",
              "length"
            ],
            additionalProperties: {
              type: "number"
            }
          }
        ],
        description: "The contents of the file"
      }
    },
    required: [
      "resource",
      "name",
      "contents"
    ],
    additionalProperties: !1
  },
  CoreThemeReference: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        const: "wordpress.org/themes",
        description: "Identifies the file resource as a WordPress Core theme"
      },
      slug: {
        type: "string",
        description: "The slug of the WordPress Core theme"
      }
    },
    required: [
      "resource",
      "slug"
    ],
    additionalProperties: !1
  },
  CorePluginReference: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        const: "wordpress.org/plugins",
        description: "Identifies the file resource as a WordPress Core plugin"
      },
      slug: {
        type: "string",
        description: "The slug of the WordPress Core plugin"
      }
    },
    required: [
      "resource",
      "slug"
    ],
    additionalProperties: !1
  },
  UrlReference: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        const: "url",
        description: "Identifies the file resource as a URL"
      },
      url: {
        type: "string",
        description: "The URL of the file"
      },
      caption: {
        type: "string",
        description: "Optional caption for displaying a progress message"
      }
    },
    required: [
      "resource",
      "url"
    ],
    additionalProperties: !1
  },
  InstallPluginOptions: {
    type: "object",
    properties: {
      activate: {
        type: "boolean",
        description: "Whether to activate the plugin after installing it."
      }
    },
    additionalProperties: !1
  },
  PHPRequest: {
    type: "object",
    properties: {
      method: {
        $ref: "#/definitions/HTTPMethod",
        description: "Request method. Default: `GET`."
      },
      url: {
        type: "string",
        description: "Request path or absolute URL."
      },
      headers: {
        $ref: "#/definitions/PHPRequestHeaders",
        description: "Request headers."
      },
      files: {
        type: "object",
        additionalProperties: {
          type: "object",
          properties: {
            size: {
              type: "number"
            },
            type: {
              type: "string"
            },
            lastModified: {
              type: "number"
            },
            name: {
              type: "string"
            },
            webkitRelativePath: {
              type: "string"
            }
          },
          required: [
            "lastModified",
            "name",
            "size",
            "type",
            "webkitRelativePath"
          ],
          additionalProperties: !1
        },
        description: "Uploaded files"
      },
      body: {
        type: "string",
        description: "Request body without the files."
      },
      formData: {
        type: "object",
        additionalProperties: {},
        description: "Form data. If set, the request body will be ignored and the content-type header will be set to `application/x-www-form-urlencoded`."
      }
    },
    required: [
      "url"
    ],
    additionalProperties: !1
  },
  HTTPMethod: {
    type: "string",
    enum: [
      "GET",
      "POST",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "PUT",
      "DELETE"
    ]
  },
  PHPRequestHeaders: {
    type: "object",
    additionalProperties: {
      type: "string"
    }
  },
  PHPRunOptions: {
    type: "object",
    properties: {
      relativeUri: {
        type: "string",
        description: "Request path following the domain:port part."
      },
      scriptPath: {
        type: "string",
        description: "Path of the .php file to execute."
      },
      protocol: {
        type: "string",
        description: "Request protocol."
      },
      method: {
        $ref: "#/definitions/HTTPMethod",
        description: "Request method. Default: `GET`."
      },
      headers: {
        $ref: "#/definitions/PHPRequestHeaders",
        description: "Request headers."
      },
      body: {
        type: "string",
        description: "Request body without the files."
      },
      fileInfos: {
        type: "array",
        items: {
          $ref: "#/definitions/FileInfo"
        },
        description: "Uploaded files."
      },
      code: {
        type: "string",
        description: "The code snippet to eval instead of a php file."
      }
    },
    additionalProperties: !1
  },
  FileInfo: {
    type: "object",
    properties: {
      key: {
        type: "string"
      },
      name: {
        type: "string"
      },
      type: {
        type: "string"
      },
      data: {
        type: "object",
        properties: {
          BYTES_PER_ELEMENT: {
            type: "number"
          },
          buffer: {
            type: "object",
            properties: {
              byteLength: {
                type: "number"
              }
            },
            required: [
              "byteLength"
            ],
            additionalProperties: !1
          },
          byteLength: {
            type: "number"
          },
          byteOffset: {
            type: "number"
          },
          length: {
            type: "number"
          }
        },
        required: [
          "BYTES_PER_ELEMENT",
          "buffer",
          "byteLength",
          "byteOffset",
          "length"
        ],
        additionalProperties: {
          type: "number"
        }
      }
    },
    required: [
      "key",
      "name",
      "type",
      "data"
    ],
    additionalProperties: !1
  },
  WordPressInstallationOptions: {
    type: "object",
    properties: {
      adminUsername: {
        type: "string"
      },
      adminPassword: {
        type: "string"
      }
    },
    additionalProperties: !1
  }
}, bl = {
  $schema: $l,
  $ref: _l,
  definitions: wl
}, Pl = [
  "6.2",
  "6.1",
  "6.0",
  "5.9",
  "nightly"
];
function Cl(t, {
  progress: e = new Ir(),
  semaphore: r = new $s({ concurrency: 3 }),
  onStepCompleted: n = () => {
  }
} = {}) {
  t = {
    ...t,
    steps: (t.steps || []).filter(Tl)
  };
  const { valid: s, errors: i } = Sl(t);
  if (!s) {
    const d = new Error(
      `Invalid blueprint: ${i[0].message} at ${i[0].instancePath}`
    );
    throw d.errors = i, d;
  }
  const c = t.steps || [], a = c.reduce(
    (d, f) => d + (f.progress?.weight || 1),
    0
  ), u = c.map(
    (d) => Rl(d, {
      semaphore: r,
      rootProgressTracker: e,
      totalProgressWeight: a
    })
  );
  return {
    versions: {
      php: hs(
        t.preferredVersions?.php,
        Ps,
        Ki
      ),
      wp: hs(
        t.preferredVersions?.wp,
        Pl,
        "6.2"
      )
    },
    run: async (d) => {
      try {
        for (const { resources: f } of u)
          for (const g of f)
            g.setPlayground(d), g.isAsync && g.resolve();
        for (const { run: f, step: g } of u) {
          const R = await f(d);
          n(R, g);
        }
      } finally {
        try {
          await d.goTo(
            t.landingPage || "/"
          );
        } catch {
        }
        e.finish();
      }
    }
  };
}
const El = new vl({ discriminator: !0 });
let rr;
function Sl(t) {
  rr = El.compile(bl);
  const e = rr(t);
  if (e)
    return { valid: e };
  const r = /* @__PURE__ */ new Set();
  for (const s of rr.errors)
    s.schemaPath.startsWith("#/properties/steps/items/anyOf") || r.add(s.instancePath);
  const n = rr.errors?.filter(
    (s) => !(s.schemaPath.startsWith("#/properties/steps/items/anyOf") && r.has(s.instancePath))
  );
  return {
    valid: e,
    errors: n
  };
}
function hs(t, e, r) {
  return t && e.includes(t) ? t : r;
}
function Tl(t) {
  return !!(typeof t == "object" && t);
}
function Rl(t, {
  semaphore: e,
  rootProgressTracker: r,
  totalProgressWeight: n
}) {
  const s = r.stage(
    (t.progress?.weight || 1) / n
  ), i = {};
  for (const f of Object.keys(t)) {
    let g = t[f];
    ro(g) && (g = mt.create(g, {
      semaphore: e
    })), i[f] = g;
  }
  const c = async (f) => {
    try {
      return s.fillSlowly(), await ji[t.step](
        f,
        await Nl(i),
        {
          tracker: s,
          initialCaption: t.progress?.caption
        }
      );
    } finally {
      s.finish();
    }
  }, a = ms(i), u = ms(i).filter(
    (f) => f.isAsync
  ), d = 1 / (u.length + 1);
  for (const f of u)
    f.progress = s.stage(d);
  return { run: c, step: t, resources: a };
}
function ms(t) {
  const e = [];
  for (const r in t) {
    const n = t[r];
    n instanceof mt && e.push(n);
  }
  return e;
}
async function Nl(t) {
  const e = {};
  for (const r in t) {
    const n = t[r];
    n instanceof mt ? e[r] = await n.resolve() : e[r] = n;
  }
  return e;
}
async function jl(t, e) {
  await t.run(e);
}
export {
  ys as activatePlugin,
  gs as activateTheme,
  oi as applyWordPressPatches,
  Cl as compileBlueprint,
  fi as cp,
  gi as defineSiteUrl,
  Cr as defineWpConfigConsts,
  wi as importFile,
  Ei as installPlugin,
  Ti as installTheme,
  Ri as login,
  hi as mkdir,
  pi as mv,
  _i as replaceSite,
  di as request,
  mi as rm,
  yi as rmdir,
  jl as runBlueprintSteps,
  ci as runPHP,
  li as runPHPWithOptions,
  Ni as runWpInstallationWizard,
  ui as setPhpIniEntry,
  Ol as setPluginProxyURL,
  Oi as setSiteOptions,
  kr as unzip,
  Ci as updateUserMeta,
  vs as writeFile,
  $i as zipEntireSite
};
