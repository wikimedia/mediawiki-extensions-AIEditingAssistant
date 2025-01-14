<?php

namespace MediaWiki\Extension\AIEditingAssistant\Rest;

use MediaWiki\Extension\AIEditingAssistant\ProviderFactory;
use MediaWiki\Rest\HttpException;
use MediaWiki\Rest\SimpleHandler;
use Wikimedia\ParamValidator\ParamValidator;

class PromptHandler extends SimpleHandler {

	/**
	 * @var ProviderFactory
	 */
	private $providerFactory;

	/**
	 * @param ProviderFactory $providerFactory
	 */
	public function __construct( ProviderFactory $providerFactory ) {
		$this->providerFactory = $providerFactory;
	}

	public function execute() {
		try {
			$provider = $this->providerFactory->getActiveProvider();
			$provider->setSession( $this->getSession() );
		} catch ( \Exception $e ) {
			throw new HttpException( $e->getMessage(), 400 );
		}
		$body = $this->getValidatedBody();
		$command = $body['command'];
		$text = $body['text'];
		$status = $provider->executePrompt( $command, $text, $body['isContinuation'] );
		if ( !$status->isOK() ) {
			throw new HttpException( $status->getMessage(), 500 );
		} else {
			return $this->getResponseFactory()->createJson( [
				'success' => true,
				'result' => $status->getValue()
			] );
		}
	}

	/** @inheritDoc */
	public function getBodyParamSettings(): array {
		return [
			'command' => [
				self::PARAM_SOURCE => 'body',
				ParamValidator::PARAM_REQUIRED => true,
			],
			'text' => [
				self::PARAM_SOURCE => 'body',
				ParamValidator::PARAM_REQUIRED => true,
			],
			'isContinuation' => [
				self::PARAM_SOURCE => 'body',
				ParamValidator::PARAM_TYPE => 'boolean',
				ParamValidator::PARAM_DEFAULT => false,
			],
		];
	}

	/**
	 * @return bool
	 */
	public function needsWriteAccess() {
		return true;
	}
}
