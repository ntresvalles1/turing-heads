// Generated by dts-bundle-generator v7.2.0

import * as Comlink from 'comlink';
import { Remote } from 'comlink';

export type WithAPIState = {
	/**
	 * Resolves to true when the remote API is ready for
	 * Comlink communication, but not necessarily fully initialized yet.
	 */
	isConnected: () => Promise<void>;
	/**
	 * Resolves to true when the remote API is declares it's
	 * fully loaded and ready to be used.
	 */
	isReady: () => Promise<void>;
};
export type RemoteAPI<T> = Comlink.Remote<T> & WithAPIState;
export declare function consumeAPI<APIType>(remote: Worker | Window): RemoteAPI<APIType>;
export type PublicAPI<Methods, PipedAPI = unknown> = RemoteAPI<Methods & PipedAPI>;
export declare function exposeAPI<Methods, PipedAPI>(apiMethods?: Methods, pipedApi?: PipedAPI): [
	() => void,
	(e: Error) => void,
	PublicAPI<Methods, PipedAPI>
];
export interface PHPResponseData {
	/**
	 * Response headers.
	 */
	readonly headers: Record<string, string[]>;
	/**
	 * Response body. Contains the output from `echo`,
	 * `print`, inline HTML etc.
	 */
	readonly bytes: ArrayBuffer;
	/**
	 * Stderr contents, if any.
	 */
	readonly errors: string;
	/**
	 * The exit code of the script. `0` is a success, while
	 * `1` and `2` indicate an error.
	 */
	readonly exitCode: number;
	/**
	 * Response HTTP status code, e.g. 200.
	 */
	readonly httpStatusCode: number;
}
declare class PHPResponse implements PHPResponseData {
	/** @inheritDoc */
	readonly headers: Record<string, string[]>;
	/** @inheritDoc */
	readonly bytes: ArrayBuffer;
	/** @inheritDoc */
	readonly errors: string;
	/** @inheritDoc */
	readonly exitCode: number;
	/** @inheritDoc */
	readonly httpStatusCode: number;
	constructor(httpStatusCode: number, headers: Record<string, string[]>, body: ArrayBuffer, errors?: string, exitCode?: number);
	static fromRawData(data: PHPResponseData): PHPResponse;
	toRawData(): PHPResponseData;
	/**
	 * Response body as JSON.
	 */
	get json(): any;
	/**
	 * Response body as text.
	 */
	get text(): string;
}
/**
 * Handles HTTP requests using PHP runtime as a backend.
 *
 * @public
 * @example Use PHPRequestHandler implicitly with a new PHP instance:
 * ```js
 * import { PHP } from '@php-wasm/web';
 *
 * const php = await PHP.load( '7.4', {
 *     requestHandler: {
 *         // PHP FS path to serve the files from:
 *         documentRoot: '/www',
 *
 *         // Used to populate $_SERVER['SERVER_NAME'] etc.:
 *         absoluteUrl: 'http://127.0.0.1'
 *     }
 * } );
 *
 * php.mkdirTree('/www');
 * php.writeFile('/www/index.php', '<?php echo "Hi from PHP!"; ');
 *
 * const response = await php.request({ path: '/index.php' });
 * console.log(response.text);
 * // "Hi from PHP!"
 * ```
 *
 * @example Explicitly create a PHPRequestHandler instance and run a PHP script:
 * ```js
 * import {
 *   loadPHPRuntime,
 *   PHP,
 *   PHPRequestHandler,
 *   getPHPLoaderModule,
 * } from '@php-wasm/web';
 *
 * const runtime = await loadPHPRuntime( await getPHPLoaderModule('7.4') );
 * const php = new PHP( runtime );
 *
 * php.mkdirTree('/www');
 * php.writeFile('/www/index.php', '<?php echo "Hi from PHP!"; ');
 *
 * const server = new PHPRequestHandler(php, {
 *     // PHP FS path to serve the files from:
 *     documentRoot: '/www',
 *
 *     // Used to populate $_SERVER['SERVER_NAME'] etc.:
 *     absoluteUrl: 'http://127.0.0.1'
 * });
 *
 * const response = server.request({ path: '/index.php' });
 * console.log(response.text);
 * // "Hi from PHP!"
 * ```
 */
export interface RequestHandler {
	/**
	 * Serves the request – either by serving a static file, or by
	 * dispatching it to the PHP runtime.
	 *
	 * The request() method mode behaves like a web server and only works if
	 * the PHP was initialized with a `requestHandler` option (which the online version
	 * of WordPress Playground does by default).
	 *
	 * In the request mode, you pass an object containing the request information
	 * (method, headers, body, etc.) and the path to the PHP file to run:
	 *
	 * ```ts
	 * const php = PHP.load('7.4', {
	 * 	requestHandler: {
	 * 		documentRoot: "/www"
	 * 	}
	 * })
	 * php.writeFile("/www/index.php", `<?php echo file_get_contents("php://input");`);
	 * const result = await php.request({
	 * 	method: "GET",
	 * 	headers: {
	 * 		"Content-Type": "text/plain"
	 * 	},
	 * 	body: "Hello world!",
	 * 	path: "/www/index.php"
	 * });
	 * // result.text === "Hello world!"
	 * ```
	 *
	 * The `request()` method cannot be used in conjunction with `cli()`.
	 *
	 * @example
	 * ```js
	 * const output = await php.request({
	 * 	method: 'GET',
	 * 	url: '/index.php',
	 * 	headers: {
	 * 		'X-foo': 'bar',
	 * 	},
	 * 	formData: {
	 * 		foo: 'bar',
	 * 	},
	 * });
	 * console.log(output.stdout); // "Hello world!"
	 * ```
	 *
	 * @param  request - PHP Request data.
	 */
	request(request: PHPRequest, maxRedirects?: number): Promise<PHPResponse>;
	/**
	 * Converts a path to an absolute URL based at the PHPRequestHandler
	 * root.
	 *
	 * @param  path The server path to convert to an absolute URL.
	 * @returns The absolute URL.
	 */
	pathToInternalUrl(path: string): string;
	/**
	 * Converts an absolute URL based at the PHPRequestHandler to a relative path
	 * without the server pathname and scope.
	 *
	 * @param  internalUrl An absolute URL based at the PHPRequestHandler root.
	 * @returns The relative path.
	 */
	internalUrlToPath(internalUrl: string): string;
	/**
	 * The absolute URL of this PHPRequestHandler instance.
	 */
	absoluteUrl: string;
	/**
	 * The directory in the PHP filesystem where the server will look
	 * for the files to serve. Default: `/var/www`.
	 */
	documentRoot: string;
}
export interface IsomorphicLocalPHP extends RequestHandler {
	/**
	 * Sets the path to the php.ini file to use for the PHP instance.
	 *
	 * @param path - The path to the php.ini file.
	 */
	setPhpIniPath(path: string): void;
	/**
	 * Sets a value for a specific key in the php.ini file for the PHP instance.
	 *
	 * @param key - The key to set the value for.
	 * @param value - The value to set for the key.
	 */
	setPhpIniEntry(key: string, value: string): void;
	/**
	 * Recursively creates a directory with the given path in the PHP filesystem.
	 * For example, if the path is `/root/php/data`, and `/root` already exists,
	 * it will create the directories `/root/php` and `/root/php/data`.
	 *
	 * @param  path - The directory path to create.
	 */
	mkdir(path: string): void;
	/**
	 * @deprecated Use mkdir instead.
	 */
	mkdirTree(path: string): void;
	/**
	 * Reads a file from the PHP filesystem and returns it as a string.
	 *
	 * @throws {@link @php-wasm/universal:ErrnoError} – If the file doesn't exist.
	 * @param  path - The file path to read.
	 * @returns The file contents.
	 */
	readFileAsText(path: string): string;
	/**
	 * Reads a file from the PHP filesystem and returns it as an array buffer.
	 *
	 * @throws {@link @php-wasm/universal:ErrnoError} – If the file doesn't exist.
	 * @param  path - The file path to read.
	 * @returns The file contents.
	 */
	readFileAsBuffer(path: string): Uint8Array;
	/**
	 * Overwrites data in a file in the PHP filesystem.
	 * Creates a new file if one doesn't exist yet.
	 *
	 * @param  path - The file path to write to.
	 * @param  data - The data to write to the file.
	 */
	writeFile(path: string, data: string | Uint8Array): void;
	/**
	 * Removes a file from the PHP filesystem.
	 *
	 * @throws {@link @php-wasm/universal:ErrnoError} – If the file doesn't exist.
	 * @param  path - The file path to remove.
	 */
	unlink(path: string): void;
	/**
	 * Moves a file or directory in the PHP filesystem to a
	 * new location.
	 *
	 * @param oldPath The path to rename.
	 * @param newPath The new path.
	 */
	mv(oldPath: string, newPath: string): void;
	/**
	 * Removes a directory from the PHP filesystem.
	 *
	 * @param path The directory path to remove.
	 * @param options Options for the removal.
	 */
	rmdir(path: string, options?: RmDirOptions): void;
	/**
	 * Lists the files and directories in the given directory.
	 *
	 * @param  path - The directory path to list.
	 * @param  options - Options for the listing.
	 * @returns The list of files and directories in the given directory.
	 */
	listFiles(path: string, options?: ListFilesOptions): string[];
	/**
	 * Checks if a directory exists in the PHP filesystem.
	 *
	 * @param  path – The path to check.
	 * @returns True if the path is a directory, false otherwise.
	 */
	isDir(path: string): boolean;
	/**
	 * Checks if a file (or a directory) exists in the PHP filesystem.
	 *
	 * @param  path - The file path to check.
	 * @returns True if the file exists, false otherwise.
	 */
	fileExists(path: string): boolean;
	/**
	 * Changes the current working directory in the PHP filesystem.
	 * This is the directory that will be used as the base for relative paths.
	 * For example, if the current working directory is `/root/php`, and the
	 * path is `data`, the absolute path will be `/root/php/data`.
	 *
	 * @param  path - The new working directory.
	 */
	chdir(path: string): void;
	/**
	 * Runs PHP code.
	 *
	 * This low-level method directly interacts with the WebAssembly
	 * PHP interpreter.
	 *
	 * Every time you call run(), it prepares the PHP
	 * environment and:
	 *
	 * * Resets the internal PHP state
	 * * Populates superglobals ($_SERVER, $_GET, etc.)
	 * * Handles file uploads
	 * * Populates input streams (stdin, argv, etc.)
	 * * Sets the current working directory
	 *
	 * You can use run() in two primary modes:
	 *
	 * ### Code snippet mode
	 *
	 * In this mode, you pass a string containing PHP code to run.
	 *
	 * ```ts
	 * const result = await php.run({
	 * 	code: `<?php echo "Hello world!";`
	 * });
	 * // result.text === "Hello world!"
	 * ```
	 *
	 * In this mode, information like __DIR__ or __FILE__ isn't very
	 * useful because the code is not associated with any file.
	 *
	 * Under the hood, the PHP snippet is passed to the `zend_eval_string`
	 * C function.
	 *
	 * ### File mode
	 *
	 * In the file mode, you pass a scriptPath and PHP executes a file
	 * found at a that path:
	 *
	 * ```ts
	 * php.writeFile(
	 * 	"/www/index.php",
	 * 	`<?php echo "Hello world!";"`
	 * );
	 * const result = await php.run({
	 * 	scriptPath: "/www/index.php"
	 * });
	 * // result.text === "Hello world!"
	 * ```
	 *
	 * In this mode, you can rely on path-related information like __DIR__
	 * or __FILE__.
	 *
	 * Under the hood, the PHP file is executed with the `php_execute_script`
	 * C function.
	 *
	 * The `run()` method cannot be used in conjunction with `cli()`.
	 *
	 * @example
	 * ```js
	 * const result = await php.run(`<?php
	 *  $fp = fopen('php://stderr', 'w');
	 *  fwrite($fp, "Hello, world!");
	 * `);
	 * // result.errors === "Hello, world!"
	 * ```
	 *
	 * @param  options - PHP runtime options.
	 */
	run(options: PHPRunOptions): Promise<PHPResponse>;
	/**
	 * Listens to message sent by the PHP code.
	 *
	 * To dispatch messages, call:
	 *
	 *     post_message_to_js(string $data)
	 *
	 *     Arguments:
	 *         $data (string) – Data to pass to JavaScript.
	 *
	 * @example
	 *
	 * ```ts
	 * const php = await PHP.load('8.0');
	 *
	 * php.onMessage(
	 *     // The data is always passed as a string
	 *     function (data: string) {
	 *         // Let's decode and log the data:
	 *         console.log(JSON.parse(data));
	 *     }
	 * );
	 *
	 * // Now that we have a listener in place, let's
	 * // dispatch a message:
	 * await php.run({
	 *     code: `<?php
	 *         post_message_to_js(
	 *             json_encode([
	 *                 'post_id' => '15',
	 *                 'post_title' => 'This is a blog post!'
	 *             ])
	 *         ));
	 *     `,
	 * });
	 * ```
	 *
	 * @param listener Callback function to handle the message.
	 */
	onMessage(listener: MessageListener): void;
}
export type MessageListener = (data: string) => void;
export type HTTPMethod = "GET" | "POST" | "HEAD" | "OPTIONS" | "PATCH" | "PUT" | "DELETE";
export type PHPRequestHeaders = Record<string, string>;
export interface PHPRequest {
	/**
	 * Request method. Default: `GET`.
	 */
	method?: HTTPMethod;
	/**
	 * Request path or absolute URL.
	 */
	url: string;
	/**
	 * Request headers.
	 */
	headers?: PHPRequestHeaders;
	/**
	 * Uploaded files
	 */
	files?: Record<string, File>;
	/**
	 * Request body without the files.
	 */
	body?: string;
	/**
	 * Form data. If set, the request body will be ignored and
	 * the content-type header will be set to `application/x-www-form-urlencoded`.
	 */
	formData?: Record<string, unknown>;
}
export interface PHPRunOptions {
	/**
	 * Request path following the domain:port part.
	 */
	relativeUri?: string;
	/**
	 * Path of the .php file to execute.
	 */
	scriptPath?: string;
	/**
	 * Request protocol.
	 */
	protocol?: string;
	/**
	 * Request method. Default: `GET`.
	 */
	method?: HTTPMethod;
	/**
	 * Request headers.
	 */
	headers?: PHPRequestHeaders;
	/**
	 * Request body without the files.
	 */
	body?: string;
	/**
	 * Uploaded files.
	 */
	fileInfos?: FileInfo[];
	/**
	 * The code snippet to eval instead of a php file.
	 */
	code?: string;
}
export interface FileInfo {
	key: string;
	name: string;
	type: string;
	data: Uint8Array;
}
export interface RmDirOptions {
	/**
	 * If true, recursively removes the directory and all its contents.
	 * Default: true.
	 */
	recursive?: boolean;
}
export interface ListFilesOptions {
	/**
	 * If true, prepend given folder path to all file names.
	 * Default: false.
	 */
	prependPath: boolean;
}
declare const SupportedPHPVersions: readonly [
	"8.2",
	"8.1",
	"8.0",
	"7.4",
	"7.3",
	"7.2",
	"7.1",
	"7.0",
	"5.6"
];
export type SupportedPHPVersion = (typeof SupportedPHPVersions)[number];
export interface PHPRequestHandlerConfiguration {
	/**
	 * The directory in the PHP filesystem where the server will look
	 * for the files to serve. Default: `/var/www`.
	 */
	documentRoot?: string;
	/**
	 * Request Handler URL. Used to populate $_SERVER details like HTTP_HOST.
	 */
	absoluteUrl?: string;
	/**
	 * Callback used by the PHPRequestHandler to decide whether
	 * the requested path refers to a PHP file or a static file.
	 */
	isStaticFilePath?: (path: string) => boolean;
}
declare class PHPRequestHandler implements RequestHandler {
	#private;
	/**
	 * The PHP instance
	 */
	php: BasePHP;
	/**
	 * @param  php    - The PHP instance.
	 * @param  config - Request Handler configuration.
	 */
	constructor(php: BasePHP, config?: PHPRequestHandlerConfiguration);
	/** @inheritDoc */
	pathToInternalUrl(path: string): string;
	/** @inheritDoc */
	internalUrlToPath(internalUrl: string): string;
	get isRequestRunning(): boolean;
	/** @inheritDoc */
	get absoluteUrl(): string;
	/** @inheritDoc */
	get documentRoot(): string;
	/** @inheritDoc */
	request(request: PHPRequest): Promise<PHPResponse>;
}
export interface PHPBrowserConfiguration {
	/**
	 * Should handle redirects internally?
	 */
	handleRedirects?: boolean;
	/**
	 * The maximum number of redirects to follow internally. Once
	 * exceeded, request() will return the redirecting response.
	 */
	maxRedirects?: number;
}
declare class PHPBrowser implements RequestHandler {
	#private;
	requestHandler: PHPRequestHandler;
	/**
	 * @param  server - The PHP server to browse.
	 * @param  config - The browser configuration.
	 */
	constructor(requestHandler: PHPRequestHandler, config?: PHPBrowserConfiguration);
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
	request(request: PHPRequest, redirects?: number): Promise<PHPResponse>;
	/** @inheritDoc */
	pathToInternalUrl(path: string): string;
	/** @inheritDoc */
	internalUrlToPath(internalUrl: string): string;
	/** @inheritDoc */
	get absoluteUrl(): string;
	/** @inheritDoc */
	get documentRoot(): string;
}
export type PHPRuntimeId = number;
export type PHPRuntime = any;
export type PHPLoaderModule = {
	dependencyFilename: string;
	dependenciesTotalSize: number;
	init: (jsRuntime: string, options: EmscriptenOptions) => PHPRuntime;
};
export type DataModule = {
	dependencyFilename: string;
	dependenciesTotalSize: number;
	default: (phpRuntime: PHPRuntime) => void;
};
export type EmscriptenOptions = {
	onAbort?: (message: string) => void;
	/**
	 * Set to true for debugging tricky WebAssembly errors.
	 */
	debug?: boolean;
	ENV?: Record<string, string>;
	locateFile?: (path: string) => string;
	noInitialRun?: boolean;
	dataFileDownloads?: Record<string, number>;
	print?: (message: string) => void;
	printErr?: (message: string) => void;
	quit?: (status: number, toThrow: any) => void;
	onRuntimeInitialized?: () => void;
	monitorRunDependencies?: (left: number) => void;
	onMessage?: (listener: EmscriptenMessageListener) => void;
} & Record<string, any>;
export type EmscriptenMessageListener = (type: string, data: string) => void;
declare const __private__dont__use: unique symbol;
declare abstract class BasePHP implements IsomorphicLocalPHP {
	#private;
	protected [__private__dont__use]: any;
	requestHandler?: PHPBrowser;
	/**
	 * Initializes a PHP runtime.
	 *
	 * @internal
	 * @param  PHPRuntime - Optional. PHP Runtime ID as initialized by loadPHPRuntime.
	 * @param  serverOptions - Optional. Options for the PHPRequestHandler. If undefined, no request handler will be initialized.
	 */
	constructor(PHPRuntimeId?: PHPRuntimeId, serverOptions?: PHPRequestHandlerConfiguration);
	/** @inheritDoc */
	onMessage(listener: MessageListener): Promise<void>;
	/** @inheritDoc */
	get absoluteUrl(): string;
	/** @inheritDoc */
	get documentRoot(): string;
	/** @inheritDoc */
	pathToInternalUrl(path: string): string;
	/** @inheritDoc */
	internalUrlToPath(internalUrl: string): string;
	initializeRuntime(runtimeId: PHPRuntimeId): void;
	/** @inheritDoc */
	setPhpIniPath(path: string): void;
	/** @inheritDoc */
	setPhpIniEntry(key: string, value: string): void;
	/** @inheritDoc */
	chdir(path: string): void;
	/** @inheritDoc */
	request(request: PHPRequest, maxRedirects?: number): Promise<PHPResponse>;
	/** @inheritDoc */
	run(request: PHPRunOptions): Promise<PHPResponse>;
	addServerGlobalEntry(key: string, value: string): void;
	/** @inheritDoc */
	mkdir(path: string): void;
	/** @inheritDoc */
	mkdirTree(path: string): void;
	/** @inheritDoc */
	readFileAsText(path: string): string;
	/** @inheritDoc */
	readFileAsBuffer(path: string): Uint8Array;
	/** @inheritDoc */
	writeFile(path: string, data: string | Uint8Array): void;
	/** @inheritDoc */
	unlink(path: string): void;
	/** @inheritDoc */
	mv(fromPath: string, toPath: string): void;
	/** @inheritDoc */
	rmdir(path: string, options?: RmDirOptions): void;
	/** @inheritDoc */
	listFiles(path: string, options?: ListFilesOptions): string[];
	/** @inheritDoc */
	isDir(path: string): boolean;
	/** @inheritDoc */
	fileExists(path: string): boolean;
}
export interface MonitoredModule {
	dependencyFilename: string;
	dependenciesTotalSize: number;
}
declare class EmscriptenDownloadMonitor extends EventTarget {
	#private;
	constructor(modules?: MonitoredModule[]);
	getEmscriptenOptions(): {
		dataFileDownloads: Record<string, any>;
	};
	setModules(modules: MonitoredModule[]): void;
}
export interface PHPWebLoaderOptions {
	emscriptenOptions?: EmscriptenOptions;
	downloadMonitor?: EmscriptenDownloadMonitor;
	requestHandler?: PHPRequestHandlerConfiguration;
	dataModules?: Array<DataModule | Promise<DataModule>>;
}
export declare class WebPHP extends BasePHP {
	/**
	 * Creates a new PHP instance.
	 *
	 * Dynamically imports the PHP module, initializes the runtime,
	 * and sets up networking. It's a shorthand for the lower-level
	 * functions like `getPHPLoaderModule`, `loadPHPRuntime`, and
	 * `PHP.initializeRuntime`
	 *
	 * @param phpVersion The PHP Version to load
	 * @param options The options to use when loading PHP
	 * @returns A new PHP instance
	 */
	static load(phpVersion: SupportedPHPVersion, options?: PHPWebLoaderOptions): Promise<WebPHP>;
	/**
	 * Does what load() does, but synchronously returns
	 * an object with the PHP instance and a promise that
	 * resolves when the PHP instance is ready.
	 *
	 * @see load
	 */
	static loadSync(phpVersion: SupportedPHPVersion, options?: PHPWebLoaderOptions): {
		php: WebPHP;
		phpReady: Promise<WebPHP>;
	};
}
/**
 * A PHP client that can be used to run PHP code in the browser.
 */
export declare class WebPHPEndpoint implements IsomorphicLocalPHP {
	/** @inheritDoc @php-wasm/universal!RequestHandler.absoluteUrl  */
	absoluteUrl: string;
	/** @inheritDoc @php-wasm/universal!RequestHandler.documentRoot  */
	documentRoot: string;
	/** @inheritDoc */
	constructor(php: BasePHP, monitor?: EmscriptenDownloadMonitor);
	/** @inheritDoc @php-wasm/universal!RequestHandler.pathToInternalUrl  */
	pathToInternalUrl(path: string): string;
	/** @inheritDoc @php-wasm/universal!RequestHandler.internalUrlToPath  */
	internalUrlToPath(internalUrl: string): string;
	/**
	 * The onDownloadProgress event listener.
	 */
	onDownloadProgress(callback: (progress: CustomEvent<ProgressEvent>) => void): Promise<void>;
	/** @inheritDoc @php-wasm/universal!IsomorphicLocalPHP.mv  */
	mv(fromPath: string, toPath: string): void;
	/** @inheritDoc @php-wasm/universal!IsomorphicLocalPHP.rmdir  */
	rmdir(path: string, options?: RmDirOptions): void;
	/** @inheritDoc @php-wasm/universal!RequestHandler.request */
	request(request: PHPRequest, redirects?: number): Promise<PHPResponse>;
	/** @inheritDoc @php-wasm/web!WebPHP.run */
	run(request: PHPRunOptions): Promise<PHPResponse>;
	/** @inheritDoc @php-wasm/web!WebPHP.chdir */
	chdir(path: string): void;
	/** @inheritDoc @php-wasm/web!WebPHP.setPhpIniPath */
	setPhpIniPath(path: string): void;
	/** @inheritDoc @php-wasm/web!WebPHP.setPhpIniEntry */
	setPhpIniEntry(key: string, value: string): void;
	/** @inheritDoc @php-wasm/web!WebPHP.mkdir */
	mkdir(path: string): void;
	/** @inheritDoc @php-wasm/web!WebPHP.mkdirTree */
	mkdirTree(path: string): void;
	/** @inheritDoc @php-wasm/web!WebPHP.readFileAsText */
	readFileAsText(path: string): string;
	/** @inheritDoc @php-wasm/web!WebPHP.readFileAsBuffer */
	readFileAsBuffer(path: string): Uint8Array;
	/** @inheritDoc @php-wasm/web!WebPHP.writeFile */
	writeFile(path: string, data: string | Uint8Array): void;
	/** @inheritDoc @php-wasm/web!WebPHP.unlink */
	unlink(path: string): void;
	/** @inheritDoc @php-wasm/web!WebPHP.listFiles */
	listFiles(path: string, options?: ListFilesOptions): string[];
	/** @inheritDoc @php-wasm/web!WebPHP.isDir */
	isDir(path: string): boolean;
	/** @inheritDoc @php-wasm/web!WebPHP.fileExists */
	fileExists(path: string): boolean;
	/** @inheritDoc @php-wasm/web!WebPHP.onMessage */
	onMessage(listener: MessageListener): void;
}
export declare function getPHPLoaderModule(version?: SupportedPHPVersion): Promise<PHPLoaderModule>;
/**
 * Run this in the main application to register the service worker or
 * reload the registered worker if the app expects a different version
 * than the currently registered one.
 *
 * @param {string} scriptUrl       The URL of the service worker script.
 * @param {string} expectedVersion The expected version of the service worker script. If
 *                                 mismatched with the actual version, the service worker
 *                                 will be re-registered.
 */
export declare function registerServiceWorker<Client extends Remote<WebPHPEndpoint>>(phpApi: Client, scope: string, scriptUrl: string): Promise<void>;
export declare function parseWorkerStartupOptions<T extends Record<string, string>>(): T;
/**
 * Spawns a new Worker Thread.
 *
 * @param  workerUrl The absolute URL of the worker script.
 * @param  config
 * @returns The spawned Worker Thread.
 */
export declare function spawnPHPWorkerThread(workerUrl: string, startupOptions?: Record<string, string>): Promise<Worker>;

export {};
