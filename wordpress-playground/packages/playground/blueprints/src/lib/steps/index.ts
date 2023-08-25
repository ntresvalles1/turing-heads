import { ProgressTracker } from '@php-wasm/progress';
import { UniversalPHP } from '@php-wasm/universal';
import { FileReference } from '../resources';
import { ActivatePluginStep } from './activate-plugin';
import { ApplyWordPressPatchesStep } from './apply-wordpress-patches';
import { DefineSiteUrlStep } from './define-site-url';
import { ImportFileStep, ReplaceSiteStep, UnzipStep } from './import-export';
import { InstallPluginStep, InstallPluginOptions } from './install-plugin';
import { InstallThemeStep, InstallThemeOptions } from './install-theme';
import { LoginStep } from './login';
import {
	RunWpInstallationWizardStep,
	WordPressInstallationOptions,
} from './run-wp-installation-wizard';
import { SetSiteOptionsStep, UpdateUserMetaStep } from './site-data';
import {
	RmStep,
	CpStep,
	MkdirStep,
	RmdirStep,
	MvStep,
	SetPhpIniEntryStep,
	RunPHPStep,
	RunPHPWithOptionsStep,
	RequestStep,
	WriteFileStep,
} from './client-methods';
import { DefineWpConfigConstsStep } from './define-wp-config-consts';
import { ActivateThemeStep } from './activate-theme';

export type Step = GenericStep<FileReference>;
export type StepDefinition = Step & {
	progress?: {
		weight?: number;
		caption?: string;
	};
};

/**
 * If you add a step here, make sure to also
 * add it to the exports below.
 */
export type GenericStep<Resource> =
	| ActivatePluginStep
	| ActivateThemeStep
	| ApplyWordPressPatchesStep
	| CpStep
	| DefineWpConfigConstsStep
	| DefineSiteUrlStep
	| ImportFileStep<Resource>
	| InstallPluginStep<Resource>
	| InstallThemeStep<Resource>
	| LoginStep
	| MkdirStep
	| MvStep
	| RequestStep
	| ReplaceSiteStep<Resource>
	| RmStep
	| RmdirStep
	| RunPHPStep
	| RunPHPWithOptionsStep
	| RunWpInstallationWizardStep
	| SetPhpIniEntryStep
	| SetSiteOptionsStep
	| UnzipStep
	| UpdateUserMetaStep
	| WriteFileStep<Resource>;

export type {
	ActivatePluginStep,
	ActivateThemeStep,
	ApplyWordPressPatchesStep,
	CpStep,
	DefineWpConfigConstsStep,
	DefineSiteUrlStep,
	ImportFileStep,
	InstallPluginStep,
	InstallPluginOptions,
	InstallThemeStep,
	InstallThemeOptions,
	LoginStep,
	MkdirStep,
	MvStep,
	RequestStep,
	ReplaceSiteStep,
	RmStep,
	RmdirStep,
	RunPHPStep,
	RunPHPWithOptionsStep,
	RunWpInstallationWizardStep,
	WordPressInstallationOptions,
	SetPhpIniEntryStep,
	SetSiteOptionsStep,
	UnzipStep,
	UpdateUserMetaStep,
	WriteFileStep,
};

/**
 * Progress reporting details.
 */
export type StepProgress = {
	tracker: ProgressTracker;
	initialCaption?: string;
};

export type StepHandler<S extends GenericStep<File>> = (
	/**
	 * A PHP instance or Playground client.
	 */
	php: UniversalPHP,
	args: Omit<S, 'step'>,
	progressArgs?: StepProgress
) => any;
