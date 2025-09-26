<?php

namespace App\Services;

use GuzzleHttp\Client;
use Storage;
use OpenAI;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    protected $client;
    protected $clientGuzzle;
    protected $apiKey;
    protected $maxTokens;

    public function __construct()
    {
        $this->client = OpenAI::client(env('OPENAI_API_KEY'));
        $this->apiKey = env('OPENAI_API_KEY');
        $this->maxTokens = (int) env('OPENAI_MAX_TOKENS');
        $this->clientGuzzle = new Client([
            'base_uri' => 'https://api.openai.com',
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->apiKey,
            ],
        ]);
        $this->serverGuzzle = new Client([
            'base_uri' => 'https://api.openai.com',
            'headers' => [
                'Content-Type' => 'multipart/form-data',
                'Authorization' => 'Bearer ' . $this->apiKey,
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
                "content" => "You are a helpful assistant."
            ],
            [
                "role" => "user",
                "content" => $transcription
            ]
        ];

        $response = $this->clientGuzzle->post('/v1/chat/completions', [
            'json' => [
                'model' => 'gpt-4o-mini',
                'messages' => $messages,
                'max_tokens' => $this->maxTokens,
            ],
        ]);

        return json_decode($response->getBody(), true)['choices'][0]['message']['content'] ?? '';
    }

    public function generateImage($prompt)
    {
        // Assuming 'transcription' is a variable containing user input or text
        $transcription = $prompt;

        $response = $this->clientGuzzle->post('v1/images/generations', [
            'json' => [
                'model' => 'dall-e-3',
                'prompt' => $transcription,
                'n' => 1,
                'size' => '1024x1024',
            ],
        ]);

        return json_decode($response->getBody(), true) ?? '';
    }

    public function synthesizeSpeech($text, $voice)
    {

        // Map voice parameter to appropriate model and voice
        switch ($voice) {
            case 'alloy':
                $model = 'tts-1';
                $voiceName = 'alloy';
                break;
            case 'echo':
                $model = 'tts-1';
                $voiceName = 'echo';
                break;
            case 'fable':
                $model = 'tts-1';
                $voiceName = 'fable';
                break;
            case 'onyx':
                $model = 'tts-1';
                $voiceName = 'onyx';
                break;
            case 'nova':
                $model = 'tts-1';
                $voiceName = 'nova';
                break;
            case 'shimmer':
                $model = 'tts-1';
                $voiceName = 'shimmer';
                break;
            default:
                throw new \Exception('Invalid voice parameter.');
        }

        $response = $this->clientGuzzle->post('/v1/audio/speech', [
            'json' => [
                'model' => $model,
                'input' => $text,
                'voice' => $voiceName,
            ],
        ]);

        return $response->getBody()->getContents();
    }

    public function transcribeSpeech($audioPath)
    {
        // Get the absolute path of the stored audio file
        $audioContentPath = Storage::disk('public')->path($audioPath);

        // Check if the file exists
        if (!file_exists($audioContentPath)) {
            throw new \Exception('File does not exist at path: ' . $audioContentPath);
        }

        $response = $this->serverGuzzle->post('/v1/audio/transcriptions', [
            'multipart' => [
                [
                    'name' => 'file',
                    'contents' => fopen($audioContentPath, 'r'),
                    'filename' => basename($audioContentPath),
                ],
                [
                    'name' => 'model',
                    'contents' => 'whisper-1',
                ],
            ],
        ]);

        $result = json_decode($response->getBody(), true);

        return $result['text'] ?? '';
    }

    public function askChatGPT(string $prompt): string
    {
        $messages = [
            [
                'role' => 'system',
                'content' => 'You are a helpful assistant. Respond with plain text only, suitable for direct inclusion in a Word document. Do not use markdown, code blocks, or any special formatting.'
            ],
            [
                'role' => 'user',
                'content' => $prompt
            ],
        ];

        $response = $this->clientGuzzle->post('/v1/chat/completions', [
            'json' => [
                'model' => 'gpt-4o',
                'messages' => $messages,
                'max_tokens' => $this->maxTokens ?? 1024,
            ],
        ]);

        $result = json_decode($response->getBody(), true);

        return $result['choices'][0]['message']['content'] ?? '';
    }

    public function analyzeText($prompt, $fileUrl)
    {
        $response = $this->clientGuzzle->post('/v1/responses', [
            'json' => [
                'model' => 'gpt-5',
                'input' => [
                    [
                        'role' => 'user',
                        'content' => [
                            ['type' => 'input_text', 'text' => $prompt],
                            ['type' => 'input_file', 'file_url' => env("APP_NGROK_URL)") . $fileUrl],
                        ],
                    ],
                ],
            ],
        ]);

        $data = json_decode($response->getBody(), true);

        $outputText = $data['output'][1]['content'][0]['text'] ?? null;

        return $outputText;
    }
}
