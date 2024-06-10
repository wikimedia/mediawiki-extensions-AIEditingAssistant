<?php

namespace MediaWiki\Extension\AIEditingAssistant;

use Config;
use InvalidArgumentException;
use MediaWiki\Extension\AIEditingAssistant\Provider\IProvider;
use Wikimedia\ObjectFactory\ObjectFactory;

class ProviderFactory {
	/**
	 * @var Config
	 */
	private $config;

	/**
	 * @var array
	 */
	private $providers;

	/**
	 * @var ObjectFactory
	 */
	private $objectFactory;

	/**
	 * @param Config $config
	 * @param array $providers
	 * @param ObjectFactory $objectFactory
	 */
	public function __construct( Config $config, array $providers, ObjectFactory $objectFactory ) {
		$this->config = $config;
		$this->providers = $providers;
		$this->objectFactory = $objectFactory;
	}

	/**
	 * @return Provider\IProvider
	 */
	public function getActiveProvider(): Provider\IProvider {
		$active = $this->config->get( 'AIEditingAssistantActiveProvider' );
		$connection = $this->config->get( 'AIEditingAssistantActiveProviderConnection' );
		return $this->getProvider( $active, $connection );
	}

	/**
	 * @param string $name
	 * @param string $connection
	 *
	 * @return IProvider
	 */
	public function getProvider( string $name, string $connection = '' ): Provider\IProvider {
		if ( !isset( $this->providers[$name] ) ) {
			throw new InvalidArgumentException( "Provider $name not found" );
		}
		$provider = $this->providers[$name];
		$instance = $this->objectFactory->createObject( $provider );
		if ( !$instance instanceof Provider\IProvider ) {
			throw new InvalidArgumentException( "Provider $name is not an instance of IProvider" );
		}
		if ( $connection ) {
			$instance->setConnectionData( $connection );
		}
		return $instance;
	}

	/**
	 * @return array
	 */
	public function getProviderNames(): array {
		$names = [];
		foreach ( $this->providers as $name => $provider ) {
			try {
				$object = $this->getProvider( $name );
			} catch ( InvalidArgumentException $e ) {
				continue;
			}
			$names[$name] = $object->getLabel();
		}

		return $names;
	}
}
