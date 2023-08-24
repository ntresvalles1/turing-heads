import { StepHandler } from '.';
export declare const VFS_TMP_DIRECTORY = "/vfs-blueprints";
/**
 * @inheritDoc defineWpConfigConsts
 * @hasRunnableExample
 * @example
 *
 * <code>
 * {
 * 		"step": "defineWpConfigConsts",
 * 		"consts": {
 *          "WP_DEBUG": true
 *      },
 *      "virtualize": true
 * }
 * </code>
 */
export interface DefineWpConfigConstsStep {
    step: 'defineWpConfigConsts';
    /** The constants to define */
    consts: Record<string, unknown>;
    /**
     * Enables the virtualization of wp-config.php and playground-consts.json files, leaving the local system files untouched.
     * The variables defined in the /vfs-blueprints/playground-consts.json file are loaded via the auto_prepend_file directive in the php.ini file.
     * @default false
     * @see https://www.php.net/manual/en/ini.core.php#ini.auto-prepend-file
     */
    virtualize?: boolean;
}
/**
 * Defines the wp-config.php constants
 *
 * @param playground The playground client.
 * @param wpConfigConst
 */
export declare const defineWpConfigConsts: StepHandler<DefineWpConfigConstsStep>;
