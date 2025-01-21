<?php

namespace MediaWiki\Extension\AIEditingAssistant\Provider;

use MediaWiki\Http\HttpRequestFactory;
use MediaWiki\Message\Message;
use MediaWiki\Session\Session;
use RuntimeException;
use Status;

class OpenAI implements IProvider {

	/**
	 * @var HttpRequestFactory
	 */
	private $httpRequestFactory;

	/**
	 * @var string
	 */
	private $secret;

	/**
	 * @var Session
	 */
	private $session;

	/**
	 * @param HttpRequestFactory $httpRequestFactory
	 */
	public function __construct( HttpRequestFactory $httpRequestFactory ) {
		$this->httpRequestFactory = $httpRequestFactory;
	}

	/**
	 * @inheritDoc
	 */
	public function setConnectionData( string $connection ) {
		$this->secret = $connection;
	}

	/**
	 * @param Session $session
	 * @return void
	 */
	public function setSession( Session $session ) {
		$this->session = $session;
	}

	/**
	 * @return Message
	 */
	public function getLabel(): Message {
		return Message::newFromKey( 'aieditingassistant-provider-openai' );
	}

	/**
	 * @inheritDoc
	 */
	public function executePrompt( string $command, string $text, bool $isContinuation ): Status {
		$this->assertSession();
		$messages = $this->session->get( 'aiassistant-prompt-history' ) ?? [];
		if ( !$isContinuation ) {
			$messages = [];
			$messages[] = $this->getInitializationMessage( $text );
		}

		$messages[] = [ 'role' => 'user', 'content' => $command ];
		$this->session->set( 'aiassistant-prompt-history', $messages );
		return $this->getResponse( $messages );
	}

	/**
	 * @param array $messages
	 * @return Status
	 */
	private function getResponse( array $messages ): Status {
		$req = $this->httpRequestFactory->create(
			'https://api.openai.com/v1/chat/completions',
			[ 'method' => 'POST', 'postData' => json_encode( [
				'model' => 'gpt-3.5-turbo',
				'messages' => $messages
			] ) ]
		);
		$req->setHeader( 'Authorization', 'Bearer ' . $this->secret );
		$req->setHeader( 'Content-Type', 'application/json' );
		$res = $req->execute();
		if ( !$res->isOK() ) {
			return Status::newFatal( 'aieditingassistant-provider-failure', $res->getMessage() );
		}
		$data = json_decode( $req->getContent(), true );

		$choices = $data['choices'];
		if ( count( $choices ) === 0 ) {
			return Status::newFatal( 'aieditingassistant-provider-no-reponses' );
		}
		$choice = $choices[0];
		$reply = $choice['message']['content'];
		return Status::newGood( $reply );
	}

	/**
	 * @param string $text
	 * @return array
	 */
	private function getInitializationMessage( string $text ): array {
		$prompt = Message::newFromKey( 'aieditingassistant-initialization-command' )->params( $text )->plain();
		return [ 'role' => 'system', 'content' => $prompt ];
	}

	/**
	 * @return void
	 */
	private function assertSession() {
		if ( !( $this->session instanceof Session ) ) {
			throw new RuntimeException( 'Session not set' );
		}
	}

}
