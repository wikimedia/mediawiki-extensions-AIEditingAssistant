<?php

namespace MediaWiki\Extension\AIEditingAssistant;

use MediaWiki\Output\Hook\BeforePageDisplayHook;

class AddActiveProviderConfig implements BeforePageDisplayHook {

	/**
	 * @inheritDoc
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		if ( !$out->getTitle()->isContentPage() ) {
			return;
		}
		$out->addJsConfigVars(
			'AIEditingAssistantActiveProvider',
			$out->getConfig()->get( 'AIEditingAssistantActiveProvider' )
		);
	}
}
