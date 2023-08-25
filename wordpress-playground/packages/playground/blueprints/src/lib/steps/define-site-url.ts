import { StepHandler } from '.';
import { defineWpConfigConsts } from './define-wp-config-consts';

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
export const defineSiteUrl: StepHandler<DefineSiteUrlStep> = async (
	playground,
	{ siteUrl }
) => {
	return await defineWpConfigConsts(playground, {
		consts: {
			WP_HOME: siteUrl,
			WP_SITEURL: siteUrl,
		},
	});
};
