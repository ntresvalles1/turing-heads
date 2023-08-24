import type { UniversalPHP } from '@php-wasm/universal';
export declare function zipNameToHumanName(zipName: string): string;
type PatchFileCallback = (contents: string) => string | Uint8Array;
export declare function updateFile(php: UniversalPHP, path: string, callback: PatchFileCallback): Promise<void>;
export declare function fileToUint8Array(file: File): Promise<Uint8Array>;
declare const FileWithArrayBuffer: {
    new (fileBits: BlobPart[], fileName: string, options?: FilePropertyBag | undefined): File;
    prototype: File;
};
export { FileWithArrayBuffer as File };
