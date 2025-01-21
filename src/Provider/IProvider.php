<?php

namespace MediaWiki\Extension\AIEditingAssistant\Provider;

use MediaWiki\Message\Message;
use MediaWiki\Session\Session;
use Status;

interface IProvider {
	/**
	 * @param string $connection
	 */
	public function setConnectionData( string $connection );

	/**
	 * @param string $command
	 * @param string $text
	 * @param bool $isContinuation Whether this is a continuation of a previous prompt
	 * @return Status
	 */
	public function executePrompt( string $command, string $text, bool $isContinuation ): Status;

	/**
	 * Set session object in order to remember the conversation between prompts
	 *
	 * @param Session $session
	 * @return void
	 */
	public function setSession( Session $session );

	/**
	 * @return Message
	 */
	public function getLabel(): Message;
}
