/**
 * Early draft of a Node.js playground package.
 * This is meant to streamline the Node.js workflow
 * and make it easier to build things like VS Code extensions,
 * Express servers, and CLI tools
 */

import {
	applyWordPressPatches,
	Blueprint,
	compileBlueprint,
	runBlueprintSteps,
} from '@wp-playground/blueprints';
import { NodePHP } from '@php-wasm/node';
import { UniversalPHP } from '@php-wasm/universal';

export interface NodePlaygroundOptions {
	blueprint?: Blueprint;
	wordpressPathOnHost: string;
	serverUrl: string;
}

export async function startPlaygroundNode(
	options: NodePlaygroundOptions
): Promise<NodePHP> {
	/**
	 * @TODO figure out how to handle:
	 * * WordPress installation? There are no wp.data files like in the web version
	 * * Managing WordPress versions
	 * * Exisiting WordPress installations
	 * * Mounting existing themes, plugins, and core WP files
	 *
	 * Perhaps there is too much custom logic to be able to even have
	 * a generic "startPlaygroundNode" function?
	 *
	 * @TODO use this workflow to compile WordPress for the web
	 */
	const compiled = compileBlueprint(options.blueprint || {});
	const playground = await NodePHP.load(compiled.versions.php, {
		requestHandler: {
			documentRoot: options.wordpressPathOnHost,
			absoluteUrl: options.serverUrl,
		},
	});

	await applyWordPressPatches(playground, {
		siteUrl: options.serverUrl,
		wordpressPath: options.wordpressPathOnHost,
		addPhpInfo: true,
		patchSecrets: true,
		disableSiteHealth: true,
		disableWpNewBlogNotification: true,
	});

	await allowWpOrgHosts(playground, options.wordpressPathOnHost);

	await runBlueprintSteps(compiled, playground);
	return playground;
}

export async function allowWpOrgHosts(
	php: UniversalPHP,
	wordpressPath: string
) {
	await php.mkdir(`${wordpressPath}/wp-content/mu-plugins`);
	await php.writeFile(
		`${wordpressPath}/wp-content/mu-plugins/0-allow-wp-org.php`,
		`<?php
		// Needed because gethostbyname( 'wordpress.org' ) returns
		// a private network IP address for some reason.
		add_filter( 'allowed_redirect_hosts', function( $deprecated = '' ) {
			return array( 
				'wordpress.org',
				'api.wordpress.org',
				'downloads.wordpress.org',
			);
		} );`
	);
}
