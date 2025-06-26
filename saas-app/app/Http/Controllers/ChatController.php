<?php

namespace App\Http\Controllers;

use App\Events\Message;
use App\Events\UserTyping;
use App\Events\AiThinking;
use App\Events\UserSpeech;
use App\Models\Message as MessageModel;
use Illuminate\Http\Request;
use App\Models\User;
use Auth;
use Storage;
use App\Services\OpenAIService;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    protected $user;
    protected $openAiService;
    protected $markdownService;

    public function __construct(OpenAIService $openAiService)
    {
        //$this->apiToken = uniqid(base64_encode(Str::random(40)));
        $this->middleware('auth:api');
        $this->user = new User;
        $this->openAiService = $openAiService;
    }

    /**
     * Handle the incoming chat messages.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function message(Request $request)
    {
        $user = Auth::user();

        $message = new MessageModel();
        $message->user_id = $user->id;
        $message->domain = $user->domain;
        $message->username = $request->input('username');
        $message->message = $request->input('message');
        $message->type = $request->input('type');
        $message->save();

        // Load the user relationship so the broadcast has full info
        $message->load('users');

        // ✅ Trigger the broadcast
        event(new Message($message));

        return response()->json([
            'status' => 'Message sent successfully!',
            'message' => [
                'id' => $message->id,
                'username' => $message->username,
                'message' => $message->message,
                'formatted_created_at' => $message->created_at->format('Y-m-d H:i:s'),
                'profile_picture_path' => $user->profile_picture_path,
                'gender' => $user->gender,
                'image_path' => null,
            ]
        ], 200);
    }
    
    /**
     * Retrieve the latest chat messages.
     *
     * @return \Illuminate\Http\Response
     */
    
    public function getMessages(Request $request)
    {
        $user = Auth::user();

        // Select messages with user info
        $messages = MessageModel::select('messages.*', 'users.profile_picture_path', 'users.gender')
            ->leftJoin('users', 'messages.user_id', '=', 'users.id')
            ->where(function ($query) use ($user) {
                $query->where('messages.domain', '=', $user->domain)
                    ->orWhere(function ($query) use ($user) {
                        $query->whereNull('messages.user_id')
                            ->where('messages.domain', '=', $user->domain);
                    });
            })
            ->orderBy('messages.id', 'desc')
            ->get()
            ->map(function ($message) {
                $message->formatted_created_at = $message->created_at->format('Y-m-d H:i:s');
                return $message;
            });

        $perPage = 5;
        $page = $request->input('page', 1);
        $offset = ($page - 1) * $perPage;

        $paginated = $messages->slice($offset, $perPage)->values(); // slice returns a Collection

        return response()->json([
            'messages' => $paginated,
            'current_page' => (int) $page,
            'per_page' => $perPage,
            'total' => $messages->count(),
            'last_page' => ceil($messages->count() / $perPage),
        ]);
    }


    public function userTyping(Request $request)
    {
        $username = $request->username;
        $isTyping = $request->isTyping;
        if (!$username || !isset($isTyping)) {
            return response()->json(['error' => 'Invalid typing data'], 400);
        }
        broadcast(new UserTyping($username, $isTyping))->toOthers();
        return response()->json(['status' => 'success']);
    }

    public function speech(Request $request)
    {
        $username = $request->username;
        $isSpeech = $request->isSpeech;
    
        broadcast(new UserSpeech($username, $isSpeech))->toOthers();
    
        return response()->json(['status' => 'success', 'message' => $isSpeech]);
    }
    
    public function uploadMessage(Request $request)
    {
        // Get the authenticated user's ID
        $user = Auth::user();

        // Validate incoming request
        try {
            $request->validate([
                'message' => 'nullable|string',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif',
            ]);
        } catch (ValidationException $e) {
            // Log validation errors
            $errors = $e->validator->errors()->all();
            Log::error('Validation errors: ' . implode(', ', $errors));
            return response()->json(['message' => 'Validation error', 'errors' => $errors], 422);
        }

        // Handle image upload
        try {
            $imagePath = $request->file('image')->store('public/uploads');
        } catch (FileException $e) {
            Log::error('File upload error: ' . $e->getMessage());
            return response()->json(['message' => 'File upload error'], 500);
        }

        // Create new message
        $message = new MessageModel();
        $message->username = $user->name;
        $message->user_id = $user->id;
        $message->domain = $user->domain;
        $message->type = 'image';
        $message->message = $request->input('message') ?? '';
        $message->image_path = str_replace('public/', 'storage/', $imagePath); // Adjust image path for public access
        $message->save();

        // Trigger an event for the new message
        event(new Message($message));

        return response()->json(['message' => 'Image uploaded successfully'], 201);
    }

    public function captureUpload(Request $request){

        $user = Auth::user();
    
        $file = $request->file;
    
        if($file){
            $filename = uniqid() . '.jpg';    
            
            $imageData = file_get_contents($file);
            Storage::put('public/uploads/' . $filename, $imageData);
            $path = 'storage/uploads/'.$filename;
            
            // Create new message
            $message = new MessageModel();
            $message->username = $user->name;
            $message->user_id = $user->id;
            $message->domain = $user->domain;
            $message->type = 'image';
            $message->message = $request->input('message') ?? '';
            $message->image_path = $path; // Adjust image path for public access
            $message->save();

            // Trigger an event for the new message
            event(new Message($message));

            return response()->json([
                'success' => true,
                'message' => 'Your profile web-cam photo have been saved successfully.',
            ], 200);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Your profile web-cam photo is not saved successfully.',
            ], 200);
        }
      
    }

    private function analyzeMessage($messageText)
    {
        $client = new Client();

        try {
            $response = $client->post('https://api.canva.com/analyze', [
                'headers' => [
                    'Authorization' => 'Bearer ' . env('CANVA_AI_API_KEY'),
                    'Content-Type' => 'application/json',
                ],
                'body' => json_encode(['text' => $messageText]),
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            // Handle API call failure
            return ['error' => 'Unable to analyze message'];
        }
    }

    public function generateResponse(Request $request)
    {

        $prompt = $request->input('prompt');
        $response = $this->openAiService->generateText($prompt);

        return response()->json(['response' => $response]);
    }

    public function generateImage(Request $request) {
        
        $prompt = $request->input('prompt');
        $response = $this->openAiService->generateImage($prompt);

        return response()->json(['response' => $response]);

    }

    public function saveMessageToDatabase(Request $request)
    {
        $user = Auth::user();
        $data = $request->all();
        $generate = $data['generate'];
        $message = new MessageModel();

        if ($generate === true) {
            $file = file_get_contents($data['message']['data'][0]['url']);
            $fileName = 'ai_images/' . uniqid() . '.png';
            Storage::disk('public')->put($fileName, $file);

            $message->username = "AI";
            $message->user_id = null;
            $message->domain = $user->domain;
            $message->image_path = 'storage/' . $fileName;
            $message->message = $data['message']['data'][0]['revised_prompt'];
            $message->type = "image";
            $message->gender = "male";
        } else {
            $prompt = $data['message'];
            $filename = $data['filename'] ?? null;
            $type = $data['type'] ?? 'text';

            $message->username = "AI";
            $message->user_id = null;
            $message->domain = $user->domain;
            $message->message = $prompt;
            $message->gender = "male";
            $message->file_path = 'storage/' . $filename;
            $message->download_link = url('/storage/' . $filename);
            $message->type = $type;
        }
        $message->save();

        // FIXED: Pass the full model to the event
        event(new Message($message));

        return response()->json(['success' => 'Message saved successfully'], 200);
}
    public function thinking(Request $request)
    {
        $user = "AI";
        $isThinking = $request->isThinking;

        broadcast(new AiThinking($user, $isThinking))->toOthers();

        return response()->json(['status' => 'Thinking Message Sent!', 'message' => $isThinking]);
    }

    public function uploadVideo(Request $request)
    {
        // Validate the incoming request
        /*       $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,webm,mp4|max:50000', // Adjust max file size if needed
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        } */

        $user = Auth::user();

        // Handle file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');

            // Generate a unique filename
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();

            // Determine if the file is a video
            $isVideo = $file->getClientOriginalExtension() == 'mp4';

            // Move the uploaded file to the storage directory
            $path = $file->storeAs('public/uploads', $filename);

            $path_to_store_in_db = 'storage/uploads/'.$filename;

            // Create a new record in the database
            $message = new MessageModel();
            $message->username = $user->name;
            $message->user_id = $user->id;
            $message->domain = $user->domain;
            $message->type = 'video';
            $message->message = $request->input('message') ?? '';
            $message->image_path = $path_to_store_in_db; // Adjust image path for public access
            $message->save();

            // Trigger an event for the new message
             event(new Message($message));

            return response()->json(['message' => 'Media uploaded successfully'], 200);
        }

        return response()->json(['error' => 'Media file not found in request'], 400);
    }

    public function synthesize(Request $request)
    {
        $messageId = $request->input('message_id');
        $text = $request->input('text');
        $voice = $request->input('voice', 'alloy');

        // Retrieve the message by its ID
        $message = MessageModel::find($messageId);

        if ($message && $message->audio_path) {
            // If audio_path is not null, return the existing audio path
            return response()->json(['url' => Storage::url($message->audio_path)]);
        }

        $audioContent = $this->openAiService->synthesizeSpeech($text, $voice);

        $fileName = 'audio/' . uniqid() . '.mp3';
        Storage::disk('public')->put($fileName, $audioContent);

        // Update the message with the new audio path
        if ($message) {
            $message->audio_path = $fileName;
            $message->save();
        }

        return response()->json(['url' => Storage::url($fileName)]);
    }

    public function transcribe(Request $request)
    {
        $request->validate([
            'audio' => 'required|file|mimes:ogg,mp3,wav',
        ]);

        $user = Auth::user();

        $audioFile = $request->file('audio');
        $audioPath = $audioFile->store('audio', 'public');

        // Ensure the audioPath is correctly processed
        $transcription = $this->openAiService->transcribeSpeech($audioPath);

        // Create a new record in the database
        $message = new MessageModel();
        $message->username = $user->name;
        $message->user_id = $user->id;
        $message->domain = $user->domain;
        $message->message = $transcription ?? '';
        $message->save();

        // Trigger an event for the new message
        event(new Message($user->name, $transcription));

        return response()->json(['success' => true, 'transcription' => $transcription]);
    }

    public function generateWordFile(Request $request)
    {
        $prompt = $request->input('prompt');
        $aiResponse = $this->openAiService->askChatGPT($prompt);

        // Generate unique filename
        $filename = 'chatgpt_output_' . uniqid() . '.docx';
        $path = storage_path("app/public/$filename");
        $lines = explode("\n", $aiResponse);
        // Create Word file
        $phpWord = new PhpWord();
        $section = $phpWord->addSection();

        $titleStyle = ['bold' => true, 'size' => 16];
        $headingStyle = ['bold' => true, 'size' => 14];
        $normalStyle = ['size' => 12];

        foreach ($lines as $line) {
            $line = trim($line);

            if (preg_match('/^\*\*(.*?)\*\*$/', $line, $matches)) {
                $section->addText($text, $headingStyle);
            } elseif (!empty($line)) {
                // Paragraph
                $section->addText($line, $normalStyle);
            } else {
                // Line break
                $section->addTextBreak();
            }
        }
        // Save the Word file
        IOFactory::createWriter($phpWord, 'Word2007')->save($path);

        // Return filename to frontend
        return response()->json([
            'success' => true,
            'filename' => $filename,
            'message' => $aiResponse
        ]);
    }

}
