<?php

namespace MediaWiki\Extension\AIEditingAssistant\Provider;

use MediaWiki\Http\HttpRequestFactory;
use MediaWiki\Message\Message;
use MediaWiki\Session\Session;
use MediaWiki\Status\Status;
use RuntimeException;

class OpenAI implements IProvider {

	/**
	 * @var HttpRequestFactory
	 */
	private $httpRequestFactory;

	/**
	 * @var string
	 */
	private string $url = 'https://api.openai.com/v1';

	/** @var string */
	private string $model = 'gpt-3.5-turbo';

	/** @var string|null */
	private ?string $secret = null;

	/** @var string */
	private string $endpoint = 'chat/completions';

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
		$connectionData = json_decode( $connection, true );
		if ( isset( $connectionData['legacy'] ) ) {
			$this->secret = $connectionData['legacy'];
			return;
		}
		$this->url = $connectionData['url'] ?? $this->url;
		$this->endpoint = $connectionData['endpoint'] ?? $this->endpoint;
		$this->endpoint = ltrim( $this->endpoint, '/' );
		$this->model = $connectionData['model'] ?? $this->model;
		$this->secret = $connectionData['secret'] ?? null;
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
			$this->url . '/' . $this->endpoint,
			[ 'method' => 'POST', 'postData' => json_encode( [
				'model' => $this->model,
				'messages' => $messages
			] ) ]
		);
		if ( $this->secret ) {
			$req->setHeader( 'Authorization', 'Bearer ' . $this->secret );
		}
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
		$prompt = Message::newFromKey( 'aieditingassistant-initialization-command' )->params( $text )->text();
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
