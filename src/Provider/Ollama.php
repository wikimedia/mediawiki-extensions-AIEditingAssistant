<?php

namespace MediaWiki\Extension\AIEditingAssistant\Provider;

use MediaWiki\Http\HttpRequestFactory;
use MediaWiki\Message\Message;
use MediaWiki\Session\Session;
use MediaWiki\Status\Status;
use RuntimeException;

class Ollama implements IProvider {

	/**
	 * @var HttpRequestFactory
	 */
	private $httpRequestFactory;

	/**
	 * @var string
	 */
	private $url;

	/** @var string */
	private string $model = 'llama3';

	/** @var string|null */
	private ?string $secret = null;

	/** @var string */
	private string $endpoint = 'api/chat';

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
			$this->url = $connectionData['legacy'];
			return;
		}
		$this->url = $connectionData['url'] ?? '';
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
		return Message::newFromKey( 'aieditingassistant-provider-ollama' );
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
				'messages' => $messages,
				'stream' => false
			] ) ]
		);
		$req->setHeader( 'Content-Type', 'application/json' );
		if ( $this->secret ) {
			$req->setHeader( 'Authorization', 'Bearer ' . $this->secret );
		}
		$res = $req->execute();
		if ( !$res->isOK() ) {
			return Status::newFatal( 'aieditingassistant-provider-failure', $res->getMessage() );
		}
		$data = json_decode( $req->getContent(), true );

		$message = $data['message']['content'] ?? null;
		if ( !$message ) {
			return Status::newFatal( 'aieditingassistant-provider-no-reponses' );
		}

		return Status::newGood( $message );
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
