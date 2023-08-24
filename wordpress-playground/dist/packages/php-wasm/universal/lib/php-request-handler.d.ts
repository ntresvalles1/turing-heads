import { BasePHP } from './base-php';
import { PHPResponse } from './php-response';
import { PHPRequest, RequestHandler } from './universal-php';
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
export declare class PHPRequestHandler implements RequestHandler {
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
