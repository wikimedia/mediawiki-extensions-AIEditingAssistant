<?php

namespace MediaWiki\Extension\AIEditingAssistant\ConfigDefinition;

use BlueSpice\ConfigDefinition\IOverwriteGlobal;
use BlueSpice\ConfigDefinition\SecretSetting;

class ProviderConnection extends SecretSetting implements IOverwriteGlobal {

	/**
	 *
	 * @return array
	 */
	public function getPaths() {
		return [
			static::MAIN_PATH_FEATURE . '/' . static::FEATURE_EDITOR . '/AI Editing Assistant',
			static::MAIN_PATH_EXTENSION . '/AI Editing Assistant/' . static::FEATURE_EDITOR,
			static::MAIN_PATH_PACKAGE . '/' . static::PACKAGE_FREE . '/AI Editing Assistant',
		];
	}

	/**
	 *
	 * @return string
	 */
	public function getLabelMessageKey() {
		return 'aieditingassistant-config-provider-connection';
	}

	/**
	 * @return string
	 */
	public function getGlobalName() {
		return 'wgAIEditingAssistantActiveProviderConnection';
	}
}
