<?php

return [
	'AIEditingAssistant.ProviderFactory' => static function ( \MediaWiki\MediaWikiServices $services ) {
		return new \MediaWiki\Extension\AIEditingAssistant\ProviderFactory(
			$services->getMainConfig(),
			ExtensionRegistry::getInstance()->getAttribute( 'AIEditingAssistantProviders' ),
			$services->getObjectFactory()
		);
	},
];
