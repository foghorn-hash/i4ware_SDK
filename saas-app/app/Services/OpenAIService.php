<?php

namespace App\Services;

use GuzzleHttp\Client;

class OpenAIService
{
    protected $client;

    public function __construct()
    {
        $this->client = new Client([
            'base_uri' => 'https://api.openai.com',
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
            ],
        ]);
    }

    public function generateText($prompt)
    {
        // Assuming 'transcription' is a variable containing user input or text
        $transcription = $prompt;

        // Define the messages array
        $messages = [
            [
                "role" => "system",
                "content" => "You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the following text and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the discussion without needing to read the entire text. Please avoid unnecessary details or tangential points."
            ],
            [
                "role" => "user",
                "content" => $transcription
            ]
        ];

        $response = $this->client->post('/v1/chat/completions', [
            'json' => [
                'model' => 'gpt-3.5-turbo',
                'messages' => $messages,
                'max_tokens' => 1000,
            ],
        ]);

        return json_decode($response->getBody(), true)['choices'][0]['message']['content'] ?? '';
    }
}
