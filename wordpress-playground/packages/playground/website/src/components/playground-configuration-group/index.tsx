import type { PlaygroundClient } from '@wp-playground/client';

import css from './style.module.css';
import Button from '../button';
import { FormEvent, useEffect, useRef, useState } from 'react';
import Modal, { defaultStyles } from '../modal';
import { playgroundAvailableInOpfs } from './playground-available-in-opfs';
import { PlaygroundConfiguration, PlaygroundConfigurationForm } from './form';
import { reloadWithNewConfiguration } from './reload-with-new-configuration';
import {
	getIndexedDB,
	loadDirectoryHandle,
	saveDirectoryHandle,
} from './idb-opfs';
import { OPFSButton } from './opfs-button';
import { usePlaygroundContext } from '../playground-viewport/context';
import { SyncLocalFilesButton } from './sync-local-files-button';
import { StartOverButton } from './start-over-button';

interface SiteSetupGroupProps {
	initialConfiguration: PlaygroundConfiguration;
}

const canUseLocalDirectory = !!(window as any).showDirectoryPicker;

let idb: IDBDatabase | null,
	lastDirectoryHandle: FileSystemDirectoryHandle | null;
try {
	idb = await getIndexedDB();
	lastDirectoryHandle = await loadDirectoryHandle(idb);
} catch (e) {
	// Ignore errors.
}

export default function PlaygroundConfigurationGroup({
	initialConfiguration,
}: SiteSetupGroupProps) {
	const [isOpen, setOpen] = useState(false);
	const openModal = () => setOpen(true);
	const closeModal = () => setOpen(false);
	const playgroundRef = useRef<{
		promise: Promise<PlaygroundClient>;
		resolve: any;
	}>();
	const { playground } = usePlaygroundContext();
	useEffect(() => {
		if (!playgroundRef.current) {
			let resolve;
			const promise = new Promise<PlaygroundClient>((_resolve) => {
				resolve = _resolve;
			});
			playgroundRef.current = {
				promise,
				resolve,
			};
		}
		if (playground) {
			playgroundRef.current!.resolve(playground);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [!!playground]);

	const [isResumeLastDirOpen, setResumeLastDirOpen] = useState(
		initialConfiguration.storage === 'opfs-host' && !!lastDirectoryHandle
	);
	const closeResumeLastDirModal = () => setResumeLastDirOpen(false);

	const [dirName, setDirName] = useState<string | undefined>(
		lastDirectoryHandle?.name
	);
	const [mounting, setMounting] = useState(false);
	const [mountProgress, setMountProgress] = useState<any | null>(null);

	const [currentConfiguration, setCurrentConfiguration] =
		useState(initialConfiguration);

	const runningWp = useCurrentlyRunningWordPressVersion();
	const isSameOriginAsPlayground = useIsSameOriginAsPlayground(playground);

	async function handleSelectLocalDirectory() {
		let dirHandle: FileSystemDirectoryHandle;
		try {
			// Request permission to access the directory.
			// https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker
			dirHandle = await (window as any).showDirectoryPicker({
				// By specifying an ID, the browser can remember different directories for
				// different IDs.If the same ID is used for another picker, the picker opens
				// in the same directory.
				id: 'playground-directory',
				mode: 'readwrite',
			});
		} catch (e) {
			// No directory selected but log the error just in case.
			console.error(e);
			return;
		}
		setDirName(dirHandle.name);
		await handleMountLocalDirectory(dirHandle);
		closeModal();
	}

	async function handleResumeLastDir(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const perm = await (lastDirectoryHandle as any).requestPermission({
			mode: 'readwrite',
		});
		if (perm === 'granted') {
			await handleMountLocalDirectory(lastDirectoryHandle!);
		} else {
			alert('Switching to temporary site mode.');
		}
		closeResumeLastDirModal();
	}

	async function handleMountLocalDirectory(
		dirHandle: FileSystemDirectoryHandle
	) {
		const playground = await playgroundRef.current!.promise;
		if (idb) {
			await saveDirectoryHandle(idb, dirHandle);
		}

		setMounting(true);
		try {
			const isPlaygroundDir = await playgroundAvailableInOpfs(dirHandle);
			if (!isPlaygroundDir) {
				// Check if it's an empty directory.
				for await (const _ of dirHandle.values()) {
					if (_.name.startsWith('.')) continue;
					alert(
						'You need to select either an empty directory or a pre-existing Playground directory.'
					);
					return;
				}
			}

			await playground.bindOpfs(dirHandle, (progress) => {
				setMountProgress(progress);
			});

			setCurrentConfiguration({
				...currentConfiguration,
				storage: 'opfs-host',
			});
			await playground.goTo('/');

			// Read current querystring and replace storage=opfs-browser with storage=opfs-host.
			const url = new URL(window.location.href);
			url.searchParams.set('storage', 'opfs-host');
			window.history.pushState({}, '', url.toString());

			alert('You are now using WordPress from your local directory.');
		} finally {
			setMounting(false);
		}
	}

	async function handleSubmit(config: PlaygroundConfiguration) {
		const playground = await playgroundRef.current!.promise;
		if (config.resetSite && config.storage === 'opfs-browser') {
			if (
				!window.confirm(
					'This will wipe out all stored data and start a new site. Do you want to proceed?'
				)
			) {
				return;
			}
		}

		reloadWithNewConfiguration(playground!, config);
	}
	return (
		<>
			<Button onClick={openModal}>
				PHP {currentConfiguration.php} {' - '}
				WP {runningWp || currentConfiguration.wp} {' - '}
				{currentConfiguration.storage === 'opfs-host'
					? `Local (${dirName})`
					: currentConfiguration.storage === 'opfs-browser'
					? 'Persistent'
					: '⚠️ Temporary'}
			</Button>
			{currentConfiguration.storage === 'opfs-host' ? (
				<SyncLocalFilesButton />
			) : null}
			{currentConfiguration.storage === 'opfs-browser' ? (
				<StartOverButton />
			) : null}
			{isResumeLastDirOpen ? (
				<Modal
					isOpen={isResumeLastDirOpen}
					onRequestClose={closeResumeLastDirModal}
					style={{
						...defaultStyles,
						content: {
							...defaultStyles.content,
							width: 550,
						},
					}}
				>
					<h2 style={{ textAlign: 'center', marginTop: 0 }}>
						Resume working in local directory?
					</h2>
					<p>
						It seems like you were working a local directory called{' '}
						<b>"{lastDirectoryHandle!.name}"</b> during your last
						visit. Would you like to resume working in this
						directory or start fresh?
					</p>
					<form
						onSubmit={handleResumeLastDir}
						className={css.buttonsWrapper}
					>
						<Button
							size="large"
							onClick={() => {
								reloadWithNewConfiguration(playground!, {
									...initialConfiguration,
									storage: 'temporary',
								});
							}}
						>
							Start a fresh site
						</Button>
						<OPFSButton
							isMounting={mounting}
							mountProgress={mountProgress}
							type="submit"
							variant="primary"
							size="large"
							autoFocus
						>
							Resume working in "{lastDirectoryHandle!.name}"
						</OPFSButton>
					</form>
				</Modal>
			) : null}
			<Modal
				isOpen={isOpen}
				onRequestClose={closeModal}
				style={{
					...defaultStyles,
					content: {
						...defaultStyles.content,
						width: 550,
					},
				}}
			>
				<PlaygroundConfigurationForm
					currentlyRunningWordPressVersion={runningWp}
					initialData={currentConfiguration}
					onSubmit={handleSubmit}
					isMountingLocalDirectory={mounting}
					mountProgress={mountProgress}
					onSelectLocalDirectory={
						canUseLocalDirectory
							? isSameOriginAsPlayground
								? handleSelectLocalDirectory
								: 'origin-mismatch'
							: 'not-available'
					}
				/>
			</Modal>
		</>
	);
}

function useCurrentlyRunningWordPressVersion(playground?: PlaygroundClient) {
	const [
		currentlyRunningWordPressVersion,
		setCurrentlyRunningWordPressVersion,
	] = useState<string | undefined>();

	useEffect(() => {
		if (playground) {
			playground.getWordPressModuleDetails().then((details) => {
				setCurrentlyRunningWordPressVersion(details.majorVersion);
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [!playground]);

	return currentlyRunningWordPressVersion;
}

function useIsSameOriginAsPlayground(playground?: PlaygroundClient) {
	const [isSameOriginAsPlayground, setIsSameOriginAsPlayground] = useState<
		null | boolean
	>(null);

	useEffect(() => {
		if (!playground) return;
		(async () => {
			setIsSameOriginAsPlayground(
				new URL(await playground.absoluteUrl).origin ===
					window.location.origin
			);
		})();
	}, [playground]);

	return isSameOriginAsPlayground;
}
