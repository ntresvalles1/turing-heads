import { StepHandler } from '..';
/**
 * @private
 */
export interface ApplyWordPressPatchesStep {
    step: 'applyWordPressPatches';
    siteUrl?: string;
    wordpressPath?: string;
    addPhpInfo?: boolean;
    patchSecrets?: boolean;
    disableSiteHealth?: boolean;
    disableWpNewBlogNotification?: boolean;
}
export declare const applyWordPressPatches: StepHandler<ApplyWordPressPatchesStep>;
