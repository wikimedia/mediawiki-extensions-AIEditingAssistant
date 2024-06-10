<?php

namespace MediaWiki\Extension\AIEditingAssistant\Rest;

use MediaWiki\Extension\AIEditingAssistant\ProviderFactory;
use MediaWiki\Rest\HttpException;
use MediaWiki\Rest\SimpleHandler;
use MediaWiki\Rest\Validator\BodyValidator;
use MediaWiki\Rest\Validator\JsonBodyValidator;
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

	/**
	 * @param string $contentType
	 *
	 * @return BodyValidator
	 */
	public function getBodyValidator( $contentType ) {
		if ( $contentType === 'application/json' ) {
			return new JsonBodyValidator( [
				'command' => [
					ParamValidator::PARAM_REQUIRED => true,
				],
				'text' => [
					ParamValidator::PARAM_REQUIRED => true,
				],
				'isContinuation' => [
					ParamValidator::PARAM_TYPE => 'boolean',
					ParamValidator::PARAM_DEFAULT => false,
				],
			] );
		}
		return parent::getBodyValidator( $contentType );
	}

	/**
	 * @return bool
	 */
	public function needsWriteAccess() {
		return true;
	}
}
