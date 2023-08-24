import type { PHPRequestHandler } from './php-request-handler';
import type { PHPResponse } from './php-response';
import { PHPRequest, RequestHandler } from './universal-php';
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
/**
 * A fake web browser that handles PHPRequestHandler's cookies and redirects
 * internally without exposing them to the consumer.
 *
 * @public
 */
export declare class PHPBrowser implements RequestHandler {
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
