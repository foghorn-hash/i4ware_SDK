<?php

namespace App\Http\Controllers;

use App\Events\Message;
use App\Events\UserTyping;
use App\Models\Message as MessageModel;
use Illuminate\Http\Request;
use App\Models\User;
use Auth;
use Storage;
use App\Services\OpenAIService;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Str;
use App\Services\MarkdownService;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    protected $user;
    protected $openaiService;
    protected $markdownService;

    public function __construct(OpenAIService $openaiService, MarkdownService $markdownService)
    {
        //$this->apiToken = uniqid(base64_encode(Str::random(40)));
        $this->middleware('auth:api');
        $this->user = new User;
        $this->openaiService = $openaiService;
        $this->markdownService = $markdownService;
    }

    /**
     * Handle the incoming chat messages.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function message(Request $request)
    {

        // Get the authenticated user's ID
        $user = Auth::user();

        // Create a new message using the authenticated user's ID
        $message = new MessageModel();
        $message->user_id = $user->id; // Assign the user_id to the message
        $message->domain = $user->domain;
        $message->username = $request->input('username');
        $message->message = $request->input('message');
        $message->save();

        // Trigger an event for the new message
        event(new Message($request->input('username'), $request->input('message')));

        return response()->json(['status' => 'Message sent successfully!'], 200);
    }

    /**
     * Retrieve the latest chat messages.
     *
     * @return \Illuminate\Http\Response
     */
    public function getMessages()
    {
        // Get the authenticated user's ID
        $user = Auth::user();

        // Select messages including those with user_id = 0
        $messages = MessageModel::select('messages.*', 'users.profile_picture_path', 'users.gender')
        ->leftJoin('users', 'messages.user_id', '=', 'users.id') // Left join with 'users' table
        ->where(function ($query) use ($user) {
            $query->where('messages.domain', '=', $user->domain)
                ->orWhere('messages.user_id', '=', 0); // Include messages with user_id = 0
        })
        ->orderBy('messages.created_at', 'desc')
        ->get()
        ->map(function ($message) {
            // Format the created_at datetime field to a custom format
            $message->formatted_created_at = $message->created_at->format('Y-m-d H:i:s'); // Customize this format as needed
            
            return $message;
        });

        return response()->json($messages);
    }

    public function userTyping(Request $request)
    {
        $username = $request->username;
        $isTyping = $request->isTyping;
    
        broadcast(new UserTyping($username, $isTyping))->toOthers();
    
        return response()->json(['status' => 'success']);
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
        event(new Message($user->name, $request->input('message')));

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
            event(new Message($user->name, $request->input('message')));

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

    public function generateResponse(Request $request)
    {
        $user = Auth::user();

        $prompt = $request->input('prompt');
        $response = $this->openaiService->generateText($prompt);

        return response()->json(['response' => $response]);
    }

    public function saveMessageToDatabase(Request $request)
    {       
        $user = Auth::user();

        // Validate incoming request data
        $validator = Validator::make($request->all(), [
            'messagePlain' => 'required|string',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $prompt = $request->input('message');

        // Extract message content from request
        $promptPlain = $request->input('messagePlain');

        // Check if the message contains code
        $containsCode = $this->containsCode($promptPlain);

        // Apply syntax highlighting if message contains code
        if ($containsCode) {
            $highlightedMessage = $this->applySyntaxHighlighting($this->markdownService->parse(highlight_string($prompt)));
        } else {
            $highlightedMessage = $this->markdownService->parse($promptPlain); // No syntax highlighting needed
        }

        // Create new message
        $message = new MessageModel();
        $message->username = "AI";
        $message->user_id = 0;
        $message->domain = $user->domain;
        $message->message = $highlightedMessage;
        $message->save();

        // Trigger an event for the new message
        event(new Message($user->name, $promptPlain));

        return response()->json(['success' => 'Message saved successfully'], 200);
    }

    // Function to detect if message contains code
    private function containsCode($message)
    {
        // Implement your code detection logic here
        // For example, you can use regular expressions to detect code snippets
        // Modify this according to your specific needs
        return preg_match('/<code>(.*?)<\/code>/', $message);
    }

    // Function to apply syntax highlighting to code within the message
    private function applySyntaxHighlighting($message)
    {
        // Implement syntax highlighting logic using a library like `highlight.js` or `Prism.js`
        // For demonstration, you can use a placeholder method
        return $message; // Placeholder: return the original message (no syntax highlighting)
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
            event(new Message($user->name, $request->input('message')));

            return response()->json(['message' => 'Media uploaded successfully'], 200);
        }

        return response()->json(['error' => 'Media file not found in request'], 400);
    }

}
