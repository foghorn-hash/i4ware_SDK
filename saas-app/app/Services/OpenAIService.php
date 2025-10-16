<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Storage;
use OpenAI;
use Illuminate\Support\Facades\Log;
use Smalot\PdfParser\Parser;

class OpenAIService
{
    protected $client;
    protected $clientGuzzle;
    protected $serverGuzzle;
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

    public function generateText($prompt, $language = 'en')
    {
        // Assuming 'transcription' is a variable containing user input or text
        $transcription = $prompt;

        // Create language-specific system message
        $systemMessage = $this->getSystemMessageByLanguage($language);

        // Define the messages array
        $messages = [
            [
                "role" => "system",
                "content" => $systemMessage
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

    public function generateImage($prompt, $language = 'en')
    {
        // Enhance the prompt with language instruction for image description
        $languageInstruction = $this->getImageLanguageInstruction($language);
        $enhancedPrompt = $languageInstruction . $prompt;

        $response = $this->clientGuzzle->post('v1/images/generations', [
            'json' => [
                'model' => 'dall-e-3',
                'prompt' => $enhancedPrompt,
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

    public function analyzeText($prompt, $filePath = null)
    {
<<<<<<< HEAD
        $pdfContent = '';

        // If a PDF file path is provided, extract its text content
        if ($filePath && Storage::disk('public')->exists($filePath)) {
            try {
                $fullPath = storage_path('app/public/' . $filePath);

                // Initialize PDF parser
                $parser = new Parser();
                $pdf = $parser->parseFile($fullPath);

                // Extract text from PDF
                $pdfContent = $pdf->getText();

                Log::info('PDF Analysis - Successfully extracted text from PDF', [
                    'file' => $filePath,
                    'content_length' => strlen($pdfContent)
                ]);

            } catch (\Exception $e) {
                Log::error('PDF Analysis - Failed to parse PDF', [
                    'file' => $filePath,
                    'error' => $e->getMessage()
                ]);

                // Fallback to generic response if PDF parsing fails
                $pdfContent = '[PDF content could not be extracted]';
            }
        }

        // Prepare the content for analysis
        $analysisContent = "User request: " . $prompt;

        if (!empty($pdfContent)) {
            // Truncate PDF content if it's too long (keep within token limits)
            $maxContentLength = 8000; // Adjust based on your needs
            if (strlen($pdfContent) > $maxContentLength) {
                $pdfContent = substr($pdfContent, 0, $maxContentLength) . "\n\n[Content truncated due to length...]";
            }

            $analysisContent .= "\n\nPDF Content:\n" . $pdfContent;
        } else {
            $analysisContent .= "\n\n[No PDF content was provided or could not be extracted]";
        }

        $response = $this->clientGuzzle->post('/v1/chat/completions', [
            'json' => [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a helpful assistant that analyzes documents. The user has uploaded a PDF document and provided a request for analysis. Analyze the actual PDF content provided and respond to the user\'s specific request.'
                    ],
                    [
                        'role' => 'user',
                        'content' => [
                            ['type' => 'input_text', 'text' => $prompt],
                            ['type' => 'input_file', 'file_url' => env("APP_NGROK_URL)") . $fileUrl],
                        ],
                    ],
                ],
                'max_tokens' => $this->maxTokens ?? 1024,
            ],
        ]);

        $data = json_decode($response->getBody(), true);

        return $data['choices'][0]['message']['content'] ?? 'Unable to analyze the PDF document at this time.';
    }

    private function getSystemMessageByLanguage($language)
    {
        switch ($language) {
            case 'fi':
                return "Olet avulias assistentti. Vastaa aina suomeksi.";
            case 'sv':
                return "Du är en hjälpsam assistent. Svara alltid på svenska.";
            case 'en':
            default:
                return "You are a helpful assistant. Always respond in English.";
        }
    }

    private function getImageLanguageInstruction($language)
    {
        switch ($language) {
            case 'fi':
                return "Luo kuva ja kirjoita kuvaus suomeksi: ";
            case 'sv':
                return "Skapa en bild och skriv beskrivningen på svenska: ";
            case 'en':
            default:
                return "Create an image and write the description in English: ";
        }
=======
        // For now, return a simple text analysis since PDF content analysis
        // requires more complex setup with OpenAI's document parsing
        $fullUrl = env("APP_NGROK_URL", env("APP_URL")) . $fileUrl;

        return "I have received your PDF document located at: " . $fullUrl . "\n\n" .
               "PDF Analysis: " . $prompt . "\n\n" .
               "Note: This is a simplified response. The PDF file is now accessible via the ngrok tunnel for AI processing.";
>>>>>>> ngrok-url-support
    }
}
