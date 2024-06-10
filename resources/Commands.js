// Commands for generative AI
ext.AIEditingAssistant.commandRegistry.register( 'expand', {
	labelMsg: 'aieditingassistant-ui-command-expand',
	commandMsg: 'aieditingassistant-command-definition-expand',
	descriptionMsg: 'aieditingassistant-ui-description-expand'
} );
ext.AIEditingAssistant.commandRegistry.register( 'summarize', {
	labelMsg: 'aieditingassistant-ui-command-summarize',
	commandMsg: 'aieditingassistant-command-definition-summarize',
	descriptionMsg: 'aieditingassistant-ui-description-summarize'
} );
ext.AIEditingAssistant.commandRegistry.register( 'simplify', {
	labelMsg: 'aieditingassistant-ui-command-simplify',
	commandMsg: 'aieditingassistant-command-definition-simplify',
	descriptionMsg: 'aieditingassistant-ui-description-simplify'
} );
ext.AIEditingAssistant.commandRegistry.register( 'paraphrase', {
	labelMsg: 'aieditingassistant-ui-command-paraphrase',
	commandMsg: 'aieditingassistant-command-definition-paraphrase',
	descriptionMsg: 'aieditingassistant-ui-description-paraphrase'
} );
ext.AIEditingAssistant.commandRegistry.register( 'check-grammar', {
	labelMsg: 'aieditingassistant-ui-command-check-grammar',
	commandMsg: 'aieditingassistant-command-definition-check-grammar',
	descriptionMsg: 'aieditingassistant-ui-description-check-grammar'
} );
ext.AIEditingAssistant.commandRegistry.register( 'remove-redundancy', {
	labelMsg: 'aieditingassistant-ui-command-remove-redundancy',
	commandMsg: 'aieditingassistant-command-definition-remove-redundancy',
	descriptionMsg: 'aieditingassistant-ui-description-remove-redundancy',
	paramCallback: function () {
		// Demo: Gets a message key and returns a list of parameters (only for commands)
		return [];
	}
} );
