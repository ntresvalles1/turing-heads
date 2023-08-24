import { UniversalPHP } from '@php-wasm/universal';
import { StepHandler } from '.';
/**
 * Full site export support:
 */
/**
 * Export the current site as a zip file.
 *
 * @param playground Playground client.
 */
export declare function zipEntireSite(playground: UniversalPHP): Promise<File>;
/**
 * @inheritDoc replaceSite
 */
export interface ReplaceSiteStep<ResourceType> {
    step: 'replaceSite';
    /** The zip file containing the new WordPress site */
    fullSiteZip: ResourceType;
}
/**
 * Replace the current site with a site from the provided zip file.
 * Remember to install the SQLite integration plugin in the zipped site:
 * https://wordpress.org/plugins/sqlite-database-integration.
 *
 * @param playground Playground client.
 * @param fullSiteZip Zipped WordPress site.
 */
export declare const replaceSite: StepHandler<ReplaceSiteStep<File>>;
/**
 * @inheritDoc unzip
 */
export interface UnzipStep {
    step: 'unzip';
    /** The zip file to extract */
    zipPath: string;
    /** The path to extract the zip file to */
    extractToPath: string;
}
/**
 * Unzip a zip file.
 *
 * @param playground Playground client.
 * @param zipPath The zip file to unzip.
 * @param extractTo The directory to extract the zip file to.
 */
export declare const unzip: StepHandler<UnzipStep>;
/**
 * WXR and WXZ files support:
 */
/**
 * Exports the WordPress database as a WXR file using
 * the core WordPress export tool.
 *
 * @param playground Playground client
 * @returns WXR file
 */
export declare function exportWXR(playground: UniversalPHP): Promise<File>;
/**
 * Exports the WordPress database as a WXZ file using
 * the export-wxz plugin from https://github.com/akirk/export-wxz.
 *
 * @param playground Playground client
 * @returns WXZ file
 */
export declare function exportWXZ(playground: UniversalPHP): Promise<File>;
/**
 * @inheritDoc importFile
 */
export interface ImportFileStep<ResourceType> {
    step: 'importFile';
    /** The file to import */
    file: ResourceType;
}
/**
 * Uploads a file to the WordPress importer and returns the response.
 * Supports both WXR and WXZ files.
 *
 * @see https://github.com/WordPress/wordpress-importer/compare/master...akirk:wordpress-importer:import-wxz.patch
 * @param playground Playground client.
 * @param file The file to import.
 */
export declare const importFile: StepHandler<ImportFileStep<File>>;
