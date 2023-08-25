import { Semaphore } from '@php-wasm/util';
import {
	ensurePathPrefix,
	toRelativeUrl,
	removePathPrefix,
	DEFAULT_BASE_URL,
} from './urls';
import { BasePHP, normalizeHeaders } from './base-php';
import { PHPResponse } from './php-response';
import {
	FileInfo,
	PHPRequest,
	PHPRunOptions,
	RequestHandler,
} from './universal-php';

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

/** @inheritDoc */
export class PHPRequestHandler implements RequestHandler {
	#DOCROOT: string;
	#PROTOCOL: string;
	#HOSTNAME: string;
	#PORT: number;
	#HOST: string;
	#PATHNAME: string;
	#ABSOLUTE_URL: string;
	#semaphore: Semaphore;

	/**
	 * The PHP instance
	 */
	php: BasePHP;
	#isStaticFilePath: (path: string) => boolean;

	/**
	 * @param  php    - The PHP instance.
	 * @param  config - Request Handler configuration.
	 */
	constructor(php: BasePHP, config: PHPRequestHandlerConfiguration = {}) {
		this.#semaphore = new Semaphore({ concurrency: 1 });
		const {
			documentRoot = '/www/',
			absoluteUrl = typeof location === 'object' ? location?.href : '',
			isStaticFilePath = () => false,
		} = config;
		this.php = php;
		this.#DOCROOT = documentRoot;
		this.#isStaticFilePath = isStaticFilePath;

		const url = new URL(absoluteUrl);
		this.#HOSTNAME = url.hostname;
		this.#PORT = url.port
			? Number(url.port)
			: url.protocol === 'https:'
			? 443
			: 80;
		this.#PROTOCOL = (url.protocol || '').replace(':', '');
		const isNonStandardPort = this.#PORT !== 443 && this.#PORT !== 80;
		this.#HOST = [
			this.#HOSTNAME,
			isNonStandardPort ? `:${this.#PORT}` : '',
		].join('');
		this.#PATHNAME = url.pathname.replace(/\/+$/, '');
		this.#ABSOLUTE_URL = [
			`${this.#PROTOCOL}://`,
			this.#HOST,
			this.#PATHNAME,
		].join('');
	}

	/** @inheritDoc */
	pathToInternalUrl(path: string): string {
		return `${this.absoluteUrl}${path}`;
	}

	/** @inheritDoc */
	internalUrlToPath(internalUrl: string): string {
		const url = new URL(internalUrl);
		if (url.pathname.startsWith(this.#PATHNAME)) {
			url.pathname = url.pathname.slice(this.#PATHNAME.length);
		}
		return toRelativeUrl(url);
	}

	get isRequestRunning() {
		return this.#semaphore.running > 0;
	}

	/** @inheritDoc */
	get absoluteUrl() {
		return this.#ABSOLUTE_URL;
	}

	/** @inheritDoc */
	get documentRoot() {
		return this.#DOCROOT;
	}

	/** @inheritDoc */
	async request(request: PHPRequest): Promise<PHPResponse> {
		const isAbsolute =
			request.url.startsWith('http://') ||
			request.url.startsWith('https://');
		const requestedUrl = new URL(
			request.url,
			isAbsolute ? undefined : DEFAULT_BASE_URL
		);

		const normalizedRelativeUrl = removePathPrefix(
			requestedUrl.pathname,
			this.#PATHNAME
		);
		if (this.#isStaticFilePath(normalizedRelativeUrl)) {
			return this.#serveStaticFile(normalizedRelativeUrl);
		}
		return await this.#dispatchToPHP(request, requestedUrl);
	}

	/**
	 * Serves a static file from the PHP filesystem.
	 *
	 * @param  path - The requested static file path.
	 * @returns The response.
	 */
	#serveStaticFile(path: string): PHPResponse {
		const fsPath = `${this.#DOCROOT}${path}`;

		if (!this.php.fileExists(fsPath)) {
			return new PHPResponse(
				404,
				{},
				new TextEncoder().encode('404 File not found')
			);
		}
		const arrayBuffer = this.php.readFileAsBuffer(fsPath);
		return new PHPResponse(
			200,
			{
				'content-length': [`${arrayBuffer.byteLength}`],
				// @TODO: Infer the content-type from the arrayBuffer instead of the file path.
				//        The code below won't return the correct mime-type if the extension
				//        was tampered with.
				'content-type': [inferMimeType(fsPath)],
				'accept-ranges': ['bytes'],
				'cache-control': ['public, max-age=0'],
			},
			arrayBuffer
		);
	}

	/**
	 * Runs the requested PHP file with all the request and $_SERVER
	 * superglobals populated.
	 *
	 * @param  request - The request.
	 * @returns The response.
	 */
	async #dispatchToPHP(
		request: PHPRequest,
		requestedUrl: URL
	): Promise<PHPResponse> {
		/*
		 * Prevent multiple requests from running at the same time.
		 * For example, if a request is made to a PHP file that
		 * requests another PHP file, the second request may
		 * be dispatched before the first one is finished.
		 */
		const release = await this.#semaphore.acquire();
		try {
			this.php.addServerGlobalEntry('DOCUMENT_ROOT', this.#DOCROOT);
			this.php.addServerGlobalEntry(
				'HTTPS',
				this.#ABSOLUTE_URL.startsWith('https://') ? 'on' : ''
			);

			let preferredMethod: PHPRunOptions['method'] = 'GET';

			const headers: Record<string, string> = {
				host: this.#HOST,
				...normalizeHeaders(request.headers || {}),
			};
			const fileInfos: FileInfo[] = [];
			if (request.files && Object.keys(request.files).length) {
				preferredMethod = 'POST';
				for (const key in request.files) {
					const file: File = request.files[key];
					fileInfos.push({
						key,
						name: file.name,
						type: file.type,
						data: new Uint8Array(await file.arrayBuffer()),
					});
				}

				/**
				 * When the files are present, we can't use the multipart/form-data
				 * Content-type header. Instead, we rewrite the request body
				 * to application/x-www-form-urlencoded.
				 * See the phpwasm_init_uploaded_files_hash() docstring for more details.
				 */
				if (
					headers['content-type']?.startsWith('multipart/form-data')
				) {
					request.formData = parseMultipartFormDataString(
						request.body || ''
					);
					headers['content-type'] =
						'application/x-www-form-urlencoded';
					delete request.body;
				}
			}

			let body;
			if (request.formData !== undefined) {
				preferredMethod = 'POST';
				headers['content-type'] =
					headers['content-type'] ||
					'application/x-www-form-urlencoded';
				body = new URLSearchParams(
					request.formData as Record<string, string>
				).toString();
			} else {
				body = request.body;
			}

			let scriptPath;
			try {
				scriptPath = this.#resolvePHPFilePath(requestedUrl.pathname);
			} catch (error) {
				return new PHPResponse(
					404,
					{},
					new TextEncoder().encode('404 File not found')
				);
			}

			return await this.php.run({
				relativeUri: ensurePathPrefix(
					toRelativeUrl(requestedUrl),
					this.#PATHNAME
				),
				protocol: this.#PROTOCOL,
				method: request.method || preferredMethod,
				body,
				fileInfos,
				scriptPath,
				headers,
			});
		} finally {
			release();
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
	#resolvePHPFilePath(requestedPath: string): string {
		let filePath = removePathPrefix(requestedPath, this.#PATHNAME);

		// If the path mentions a .php extension, that's our file's path.
		if (filePath.includes('.php')) {
			filePath = filePath.split('.php')[0] + '.php';
		} else {
			// Otherwise, let's assume the file is $request_path/index.php
			if (!filePath.endsWith('/')) {
				filePath += '/';
			}
			if (!filePath.endsWith('index.php')) {
				filePath += 'index.php';
			}
		}

		const resolvedFsPath = `${this.#DOCROOT}${filePath}`;
		if (this.php.fileExists(resolvedFsPath)) {
			return resolvedFsPath;
		}
		if (!this.php.fileExists(`${this.#DOCROOT}/index.php`)) {
			throw new Error(`File not found: ${resolvedFsPath}`);
		}
		return `${this.#DOCROOT}/index.php`;
	}
}

/**
 * Parses a multipart/form-data string into a key-value object.
 *
 * @param multipartString
 * @returns
 */
function parseMultipartFormDataString(multipartString: string) {
	const parsedData: Record<string, string> = {};

	// Extract the boundary from the string
	const boundaryMatch = multipartString.match(/--(.*)\r\n/);
	if (!boundaryMatch) {
		return parsedData;
	}

	const boundary = boundaryMatch[1];

	// Split the string into parts
	const parts = multipartString.split(`--${boundary}`);

	// Remove the first and the last part, which are just boundary markers
	parts.shift();
	parts.pop();

	// Process each part
	parts.forEach((part: string) => {
		const headerBodySplit = part.indexOf('\r\n\r\n');
		const headers = part.substring(0, headerBodySplit).trim();
		const body = part.substring(headerBodySplit + 4).trim();

		const nameMatch = headers.match(/name="([^"]+)"/);
		if (nameMatch) {
			const name = nameMatch[1];
			parsedData[name] = body;
		}
	});

	return parsedData;
}

/**
 * Naively infer a file mime type from its path.
 *
 * @todo Infer the mime type based on the file contents.
 *       A naive function like this one can be inaccurate
 *       and potentially have negative security consequences.
 *
 * @param  path - The file path
 * @returns The inferred mime type.
 */
function inferMimeType(path: string): string {
	const extension = path.split('.').pop();
	switch (extension) {
		case 'css':
			return 'text/css';
		case 'js':
			return 'application/javascript';
		case 'png':
			return 'image/png';
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg';
		case 'gif':
			return 'image/gif';
		case 'svg':
			return 'image/svg+xml';
		case 'woff':
			return 'font/woff';
		case 'woff2':
			return 'font/woff2';
		case 'ttf':
			return 'font/ttf';
		case 'otf':
			return 'font/otf';
		case 'eot':
			return 'font/eot';
		case 'ico':
			return 'image/x-icon';
		case 'html':
			return 'text/html';
		case 'json':
			return 'application/json';
		case 'xml':
			return 'application/xml';
		case 'txt':
		case 'md':
			return 'text/plain';
		default:
			return 'application-octet-stream';
	}
}
