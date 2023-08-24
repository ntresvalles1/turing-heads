/**
 * Spawns a new Worker Thread.
 *
 * @param  workerUrl The absolute URL of the worker script.
 * @param  config
 * @returns The spawned Worker Thread.
 */
export declare function spawnPHPWorkerThread(workerUrl: string, startupOptions?: Record<string, string>): Promise<Worker>;
