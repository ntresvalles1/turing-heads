import { StepHandler } from '.';
/**
 * @inheritDoc setSiteOptions
 * @hasRunnableExample
 *
 * @example
 *
 * <code>
 * {
 *     "step": "setSiteOptions",
 *     "options": {
 *         "blogname": "My Blog",
 *         "blogdescription": "A great blog"
 *     }
 * }
 * </code>
 */
export type SetSiteOptionsStep = {
    /** The name of the step. Must be "setSiteOptions". */
    step: 'setSiteOptions';
    /** The options to set on the site. */
    options: Record<string, unknown>;
};
/**
 * Sets site options. This is equivalent to calling `update_option` for each
 * option in the `options` object.
 */
export declare const setSiteOptions: StepHandler<SetSiteOptionsStep>;
/**
 * @inheritDoc updateUserMeta
 * @hasRunnableExample
 *
 * @example
 *
 * <code>
 * {
 *     "step": "updateUserMeta",
 *     "meta": {
 * 	       "first_name": "John",
 * 	       "last_name": "Doe"
 *     },
 *     "userId": 1
 * }
 * </code>
 */
export interface UpdateUserMetaStep {
    step: 'updateUserMeta';
    /** An object of user meta values to set, e.g. { "first_name": "John" } */
    meta: Record<string, unknown>;
    /** User ID */
    userId: number;
}
/**
 * Updates user meta. This is equivalent to calling `update_user_meta` for each
 * meta value in the `meta` object.
 */
export declare const updateUserMeta: StepHandler<UpdateUserMetaStep>;
