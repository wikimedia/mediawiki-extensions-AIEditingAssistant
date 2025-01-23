<?php

namespace MediaWiki\Extension\AIEditingAssistant\ConfigDefinition;

use BlueSpice\ConfigDefinition\ArraySetting;
use BlueSpice\ConfigDefinition\IOverwriteGlobal;
use HTMLFormField;
use HTMLSelectField;
use MediaWiki\Config\Config;
use MediaWiki\Context\IContextSource;
use MediaWiki\Extension\AIEditingAssistant\ProviderFactory;
use MediaWiki\MediaWikiServices;

class ProviderType extends ArraySetting implements IOverwriteGlobal {

	/**
	 * @var ProviderFactory
	 */
	private $providerFactory;

	/**
	 *
	 * @inheritDoc
	 */
	public static function getInstance( $context, $config, $name ) {
		$callback = static::class;
		return new $callback(
			MediawikiServices::getInstance()->getService( 'AIEditingAssistant.ProviderFactory' ),
			$context,
			$config,
			$name
		);
	}

	/**
	 * @param ProviderFactory $providerFactory
	 * @param IContextSource $context
	 * @param Config $config
	 * @param string $name
	 */
	public function __construct( ProviderFactory $providerFactory, $context, $config, $name ) {
		parent::__construct( $context, $config, $name );
		$this->providerFactory = $providerFactory;
	}

	/**
	 *
	 * @return string[]
	 */
	public function getPaths() {
		return [
			static::MAIN_PATH_FEATURE . '/' . static::FEATURE_EDITOR . "/AI Editing Assistant",
			static::MAIN_PATH_EXTENSION . "/AI Editing Assistant/" . static::FEATURE_EDITOR,
			static::MAIN_PATH_PACKAGE . '/' . static::PACKAGE_FREE . "/AI Editing Assistant",
		];
	}

	/**
	 *
	 * @return HTMLFormField
	 */
	public function getHtmlFormField() {
		return new HTMLSelectField( $this->makeFormFieldParams() );
	}

	/**
	 *
	 * @return string
	 */
	public function getLabelMessageKey() {
		return 'aieditingassistant-config-provider-type';
	}

	/**
	 *
	 * @return array
	 */
	protected function getOptions() {
		$providers = $this->providerFactory->getProviderNames();
		$options = [
			$this->msg( 'aieditingassistant-config-provider-type-none' )->plain() => null,
		];
		foreach ( $providers as $key => $label ) {
			$options[$label->plain()] = $key;
		}
		return $options;
	}

	/**
	 *
	 * @return string
	 */
	public function getGlobalName() {
		return "wgAIEditingAssistantActiveProvider";
	}
}
