# Connection parameters

Use `BlueSpiceConfigManager` (Editor => AIEditingAssistant ) to configure parameters for connecting to the provider.

Config is a JSON
```json
{
    "url": "<url to service>"
    "endpoint": "<endpoint>",
    "secret": "<api-key>",
    "model": "<model-type>"
}
```

What is not needed does not need to be configured

- For OpenAI

`url` (optional) - default https://api.openai.com/v1/

`endpoint` (optional) - default chat/completions

`secret` (mandatory)

`model` (optional) - default gpt-3.5-turbo

- For Ollama

`url` (mandatory)

`endpoint` (optional) - default api/chat

`secret` (optional) - default <empty string>

`model` (optional) - default llama3