import { ProgressTracker } from '@php-wasm/progress';
import { Semaphore } from '@php-wasm/util';
import { SupportedPHPVersion, UniversalPHP } from '@php-wasm/universal';
import { StepDefinition } from './steps';
import { Blueprint } from './blueprint';
export type CompiledStep = (php: UniversalPHP) => Promise<void> | void;
declare const supportedWordPressVersions: readonly ["6.2", "6.1", "6.0", "5.9", "nightly"];
type supportedWordPressVersion = (typeof supportedWordPressVersions)[number];
export interface CompiledBlueprint {
    /** The requested versions of PHP and WordPress for the blueprint */
    versions: {
        php: SupportedPHPVersion;
        wp: supportedWordPressVersion;
    };
    /** The compiled steps for the blueprint */
    run: (playground: UniversalPHP) => Promise<void>;
}
export type OnStepCompleted = (output: any, step: StepDefinition) => any;
export interface CompileBlueprintOptions {
    /** Optional progress tracker to monitor progress */
    progress?: ProgressTracker;
    /** Optional semaphore to control access to a shared resource */
    semaphore?: Semaphore;
    /** Optional callback with step output */
    onStepCompleted?: OnStepCompleted;
}
/**
 * Compiles Blueprint into a form that can be executed.
 *
 * @param playground The PlaygroundClient to use for the compilation
 * @param blueprint The bBueprint to compile
 * @param options Additional options for the compilation
 * @returns The compiled blueprint
 */
export declare function compileBlueprint(blueprint: Blueprint, { progress, semaphore, onStepCompleted, }?: CompileBlueprintOptions): CompiledBlueprint;
export declare function validateBlueprint(blueprintMaybe: object): {
    valid: true;
    errors?: undefined;
} | {
    valid: false;
    errors: import("ajv").ErrorObject<string, Record<string, any>, unknown>[] | undefined;
};
export declare function runBlueprintSteps(compiledBlueprint: CompiledBlueprint, playground: UniversalPHP): Promise<void>;
export {};
