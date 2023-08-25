import css from './style.module.css';
import forms from '../../forms.module.css';
import { useEffect, useState } from 'react';
import {
	SupportedPHPVersion,
	SupportedPHPVersionsList,
} from '@php-wasm/universal';
import { StorageType } from '../../types';
import { OPFSButton } from './opfs-button';
import Button from '../button';

// This is duplicated in @wp-playground/remote
// @TODO: move to a shared package like @wp-playground/wordpress
export const SupportedWordPressVersions = [
	'nightly',
	'6.2',
	'6.1',
	'6.0',
	'5.9',
] as const;
export const LatestSupportedWordPressVersion = '6.2';
export const SupportedWordPressVersionsList =
	SupportedWordPressVersions as any as string[];
export type SupportedWordPressVersion =
	(typeof SupportedWordPressVersions)[number];

export interface PlaygroundConfiguration {
	wp: SupportedWordPressVersion;
	php: SupportedPHPVersion;
	storage: StorageType;
	resetSite?: boolean;
}

export interface PlaygroundConfigurationFormProps {
	currentlyRunningWordPressVersion: string | undefined;
	initialData: PlaygroundConfiguration;
	onSubmit: (config: PlaygroundConfiguration) => void;
	onSelectLocalDirectory: 'not-available' | 'origin-mismatch' | (() => any);
	isMountingLocalDirectory: boolean;
	mountProgress?: {
		files: number;
		total: number;
	};
}

export function PlaygroundConfigurationForm({
	currentlyRunningWordPressVersion,
	isMountingLocalDirectory = false,
	mountProgress,
	initialData,
	onSubmit,
	onSelectLocalDirectory,
}: PlaygroundConfigurationFormProps) {
	const [php, setPhp] = useState(initialData.php);
	const [storage, setStorage] = useState<StorageType>(initialData.storage);
	const [wp, setWp] = useState(
		initialData.wp || LatestSupportedWordPressVersion
	);
	const handleStorageChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setStorage(event.target.value as any as StorageType);
	};

	const [resetSite, setResetSite] = useState(initialData.resetSite);

	useEffect(() => {
		if (
			currentlyRunningWordPressVersion &&
			wp !== currentlyRunningWordPressVersion
		) {
			setResetSite(true);
		}
	}, [wp, resetSite, currentlyRunningWordPressVersion]);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		onSubmit({ php, storage, wp, resetSite });
	}

	async function handleSelectLocalDirectory(
		e: React.MouseEvent<HTMLButtonElement>
	) {
		e.preventDefault();
		if ('function' === typeof onSelectLocalDirectory) {
			onSelectLocalDirectory();
		}
	}

	const liveDirectoryAvailable = ![
		'not-available',
		'origin-mismatch',
	].includes(onSelectLocalDirectory as any);

	return (
		<form onSubmit={handleSubmit}>
			<h2 tabIndex={0} style={{ textAlign: 'center', marginTop: 0 }}>
				Customize Playground
			</h2>
			<div className={forms.formGroup}>
				<label htmlFor="wp-version" className={forms.groupLabel}>
					Storage type
				</label>
				<ul className={css.radioList}>
					<li>
						<input
							type="radio"
							name="storage"
							value="temporary"
							id="storage-temporary"
							className={forms.radioInput}
							onChange={handleStorageChange}
							checked={storage === 'temporary'}
						/>
						<label
							htmlFor="storage-temporary"
							className={forms.radioLabel}
						>
							Temporary: reset on page refresh
						</label>
					</li>
					<li>
						<input
							type="radio"
							name="storage"
							value="opfs-browser"
							id="storage-opfs-browser"
							className={forms.radioInput}
							onChange={handleStorageChange}
							checked={storage === 'opfs-browser'}
						/>
						<label
							htmlFor="storage-opfs-browser"
							className={forms.radioLabel}
						>
							Persistent: stored in this browser
						</label>
					</li>
					{storage === 'opfs-browser' ? (
						<li
							style={{ marginLeft: 40 }}
							className={resetSite ? css.danger : ''}
						>
							<input
								type="checkbox"
								name="reset"
								value="1"
								disabled={
									!!currentlyRunningWordPressVersion &&
									wp !== currentlyRunningWordPressVersion
								}
								id="storage-opfs-browser-reset"
								className={forms.radioInput}
								onChange={(
									event: React.ChangeEvent<HTMLInputElement>
								) => {
									setResetSite(event.target.checked);
								}}
								checked={resetSite}
							/>
							<label
								htmlFor="storage-opfs-browser-reset"
								className={forms.radioLabel}
							>
								Delete stored data and start fresh
							</label>
						</li>
					) : null}
					<li>
						<input
							type="radio"
							name="storage"
							value="opfs-host"
							id="opfs-host"
							className={
								liveDirectoryAvailable
									? forms.radioInput
									: `${forms.radioInput} ${forms.notAvailable}`
							}
							onChange={handleStorageChange}
							checked={storage === 'opfs-host'}
							disabled={!liveDirectoryAvailable}
						/>
						<label htmlFor="opfs-host" className={forms.radioLabel}>
							Live directory from your computer (beta)
							{'not-available' === onSelectLocalDirectory && (
								<span>
									<br />
									Not supported in this browser.
								</span>
							)}
							{'origin-mismatch' === onSelectLocalDirectory && (
								<span>
									<br />
									Not supported on this site.
								</span>
							)}
						</label>
					</li>
					{storage === 'opfs-host' ? (
						<li>
							<div>
								<p>
									Sync Playground with a local directory. Your
									files stay private and are <b>not</b>{' '}
									uploaded anywhere.
								</p>
								<p>Select either a:</p>
								<ul>
									<li>
										<b>Empty directory</b> – to save this
										Playground and start syncing
									</li>
									<li>
										<b>Existing Playground directory</b> –
										to load it here and start syncing
									</li>
								</ul>
								<p>
									Files changed in Playground <b>will</b> be
									synchronized to on your computer.
								</p>
								<p>
									Files changed on your computer{' '}
									<b>will not</b> be synchronized to
									Playground. You'll need to click the "Sync
									local files" button.
								</p>
								<div className={forms.submitRow}>
									<OPFSButton
										isMounting={isMountingLocalDirectory}
										mountProgress={mountProgress}
										onClick={handleSelectLocalDirectory}
										size="large"
										variant="primary"
									>
										Select a local directory
									</OPFSButton>
								</div>
							</div>
						</li>
					) : null}
				</ul>
			</div>

			{storage !== 'opfs-host' ? (
				<>
					<div
						className={`${forms.formGroup} ${forms.formGroupLinear}`}
					>
						<label
							htmlFor="php-version"
							className={forms.groupLabel}
						>
							PHP Version
						</label>
						<select
							id="php-version"
							value={php}
							className={forms.largeSelect}
							onChange={(
								event: React.ChangeEvent<HTMLSelectElement>
							) => {
								setPhp(
									event.target.value as SupportedPHPVersion
								);
							}}
						>
							{SupportedPHPVersionsList.map((version) => (
								<option key={version} value={version}>
									PHP {version}&nbsp;
								</option>
							))}
						</select>
					</div>
					<div
						className={`${forms.formGroup} ${forms.formGroupLinear} ${forms.formGroupLast}`}
					>
						<label
							htmlFor="wp-version"
							className={forms.groupLabel}
						>
							WordPress Version
						</label>
						<select
							id="wp-version"
							value={wp}
							className={forms.largeSelect}
							onChange={(
								event: React.ChangeEvent<HTMLSelectElement>
							) => {
								setWp(
									event.target
										.value as SupportedWordPressVersion
								);
							}}
						>
							{SupportedWordPressVersions.map((version) => (
								<option key={version} value={version}>
									WordPress {version}&nbsp;&nbsp;
								</option>
							))}
						</select>
					</div>
					<div className={forms.submitRow}>
						<Button type="submit" variant="primary" size="large">
							Apply changes
						</Button>
					</div>
				</>
			) : null}
		</form>
	);
}
