import { PHPBrowser } from './php-browser';
import { PHPRequestHandlerConfiguration } from './php-request-handler';
import { PHPResponse } from './php-response';
import type { PHPRuntimeId } from './load-php-runtime';
import { IsomorphicLocalPHP, MessageListener, PHPRequest, PHPRunOptions, RmDirOptions, ListFilesOptions } from './universal-php';
export declare const __private__dont__use: unique symbol;
/**
 * An environment-agnostic wrapper around the Emscripten PHP runtime
 * that universals the super low-level API and provides a more convenient
 * higher-level API.
 *
 * It exposes a minimal set of methods to run PHP scripts and to
 * interact with the PHP filesystem.
 */
export declare abstract class BasePHP implements IsomorphicLocalPHP {
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
export declare function normalizeHeaders(headers: PHPRunOptions['headers']): PHPRunOptions['headers'];
