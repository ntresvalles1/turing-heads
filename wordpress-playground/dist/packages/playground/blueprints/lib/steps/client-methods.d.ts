import { PHPRunOptions, PHPRequest } from '@php-wasm/universal';
import { StepHandler } from '.';
/**
 * @inheritDoc runPHP
 * @hasRunnableExample
 * @example
 *
 * <code>
 * {
 * 		"step": "runPHP",
 * 		"code": "<?php echo 'Hello World'; ?>"
 * }
 * </code>
 */
export interface RunPHPStep {
    /** The step identifier. */
    step: 'runPHP';
    /** The PHP code to run. */
    code: string;
}
/**
 * Runs PHP code.
 */
export declare const runPHP: StepHandler<RunPHPStep>;
/**
 * @inheritDoc runPHP
 * @hasRunnableExample
 * @example
 *
 * <code>
 * {
 * 		"step": "runPHP",
 * 		"options": {
 * 			"code": "<?php echo $_SERVER['CONTENT_TYPE']; ?>",
 * 			"headers": {
 * 				"Content-type": "text/plain"
 * 			}
 * 		}
 * }
 * </code>
 */
export interface RunPHPWithOptionsStep {
    step: 'runPHPWithOptions';
    /**
     * Run options (See /wordpress-playground/api/universal/interface/PHPRunOptions)
     */
    options: PHPRunOptions;
}
/**
 * Runs PHP code with the given options.
 */
export declare const runPHPWithOptions: StepHandler<RunPHPWithOptionsStep>;
/**
 * @inheritDoc setPhpIniEntry
 * @hasRunnableExample
 * @example
 *
 * <code>
 * {
 * 		"step": "setPhpIniEntry",
 * 		"key": "display_errors",
 * 		"value": "1"
 * }
 * </code>
 */
export interface SetPhpIniEntryStep {
    step: 'setPhpIniEntry';
    /** Entry name e.g. "display_errors" */
    key: string;
    /** Entry value as a string e.g. "1" */
    value: string;
}
/**
 * Sets a PHP ini entry.
 */
export declare const setPhpIniEntry: StepHandler<SetPhpIniEntryStep>;
/**
 * @inheritDoc request
 * @needsLogin
 * @hasRunnableExample
 * @example
 *
 * <code>
 * {
 * 		"step": "request",
 * 		"request": {
 * 			"method": "POST",
 * 			"url": "/wp-admin/admin-ajax.php",
 * 			"formData": {
 * 				"action": "my_action",
 * 				"foo": "bar"
 * 			}
 * 		}
 * }
 * </code>
 */
export interface RequestStep {
    step: 'request';
    /**
     * Request details (See /wordpress-playground/api/universal/interface/PHPRequest)
     */
    request: PHPRequest;
}
/**
 * Sends a HTTP request to the Playground.
 */
export declare const request: StepHandler<RequestStep>;
/**
 * @inheritDoc cp
 * @hasRunnableExample
 * @landingPage /index2.php
 * @example
 *
 * <code>
 * {
 * 		"step": "cp",
 * 		"fromPath": "/wordpress/index.php",
 * 		"toPath": "/wordpress/index2.php"
 * }
 * </code>
 */
export interface CpStep {
    step: 'cp';
    /** Source path */
    fromPath: string;
    /** Target path */
    toPath: string;
}
/**
 * Copies a file from one path to another.
 */
export declare const cp: StepHandler<CpStep>;
/**
 * @inheritDoc mv
 * @hasRunnableExample
 * @landingPage /index2.php
 * @example
 *
 * <code>
 * {
 * 		"step": "mv",
 * 		"fromPath": "/wordpress/index.php",
 * 		"toPath": "/wordpress/index2.php"
 * }
 * </code>
 */
export interface MvStep {
    step: 'mv';
    /** Source path */
    fromPath: string;
    /** Target path */
    toPath: string;
}
/**
 * Moves a file or directory from one path to another.
 */
export declare const mv: StepHandler<MvStep>;
/**
 * @inheritDoc mkdir
 * @hasRunnableExample
 * @example
 *
 * <code>
 * {
 * 		"step": "mkdir",
 * 		"path": "/wordpress/my-new-folder"
 * }
 * </code>
 */
export interface MkdirStep {
    step: 'mkdir';
    /** The path of the directory you want to create */
    path: string;
}
/**
 * Creates a directory at the specified path.
 */
export declare const mkdir: StepHandler<MkdirStep>;
/**
 * @inheritDoc rm
 * @hasRunnableExample
 * @landingPage /index.php
 * @example
 *
 * <code>
 * {
 * 		"step": "rm",
 * 		"path": "/wordpress/index.php"
 * }
 * </code>
 */
export interface RmStep {
    step: 'rm';
    /** The path to remove */
    path: string;
}
/**
 * Removes a file at the specified path.
 */
export declare const rm: StepHandler<RmStep>;
/**
 * @inheritDoc rmdir
 * @hasRunnableExample
 * @landingPage /wp-admin/
 * @example
 *
 * <code>
 * {
 * 		"step": "rm",
 * 		"path": "/wordpress/wp-admin"
 * }
 * </code>
 */
export interface RmdirStep {
    step: 'rmdir';
    /** The path to remove */
    path: string;
}
/**
 * Removes a directory at the specified path.
 */
export declare const rmdir: StepHandler<RmdirStep>;
/**
 * @inheritDoc writeFile
 * @hasRunnableExample
 * @landingPage /test.php
 * @example
 *
 * <code>
 * {
 * 		"step": "writeFile",
 * 		"path": "/wordpress/test.php",
 * 		"data": "<?php echo 'Hello World!'; ?>"
 * }
 * </code>
 */
export interface WriteFileStep<ResourceType> {
    step: 'writeFile';
    /** The path of the file to write to */
    path: string;
    /** The data to write */
    data: ResourceType | string | Uint8Array;
}
/**
 * Writes data to a file at the specified path.
 */
export declare const writeFile: StepHandler<WriteFileStep<File>>;
