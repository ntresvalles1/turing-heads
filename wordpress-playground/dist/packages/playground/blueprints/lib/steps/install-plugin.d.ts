import { StepHandler } from '.';
/**
 * @inheritDoc installPlugin
 * @hasRunnableExample
 * @needsLogin
 * @landingPage /wp-admin/plugins.php
 * @example
 *
 * <code>
 * {
 * 	    "step": "installPlugin",
 * 		"pluginZipFile": {
 * 			"resource": "wordpress.org/plugins",
 * 			"slug": "gutenberg"
 * 		},
 * 		"options": {
 * 			"activate": true
 * 		}
 * }
 * </code>
 */
export interface InstallPluginStep<ResourceType> {
    /**
     * The step identifier.
     */
    step: 'installPlugin';
    /**
     * The plugin zip file to install.
     */
    pluginZipFile: ResourceType;
    /**
     * Optional installation options.
     */
    options?: InstallPluginOptions;
}
export interface InstallPluginOptions {
    /**
     * Whether to activate the plugin after installing it.
     */
    activate?: boolean;
}
/**
 * Installs a WordPress plugin in the Playground.
 *
 * @param playground The playground client.
 * @param pluginZipFile The plugin zip file.
 * @param options Optional. Set `activate` to false if you don't want to activate the plugin.
 */
export declare const installPlugin: StepHandler<InstallPluginStep<File>>;
