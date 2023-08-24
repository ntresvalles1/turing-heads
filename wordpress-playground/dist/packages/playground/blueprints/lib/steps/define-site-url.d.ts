import { StepHandler } from '.';
/**
 * @inheritDoc defineSiteUrl
 * @hasRunnableExample
 * @example
 *
 * <code>
 * {
 * 		"step": "defineSiteUrl",
 * 		"siteUrl": "https://playground.wordpress.net"
 * }
 * </code>
 */
export interface DefineSiteUrlStep {
    step: 'defineSiteUrl';
    /** The URL */
    siteUrl: string;
}
/**
 * Sets WP_HOME and WP_SITEURL constants for the WordPress installation.
 *
 * @param playground The playground client.
 * @param siteUrl
 */
export declare const defineSiteUrl: StepHandler<DefineSiteUrlStep>;
