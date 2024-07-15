<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\RolePermissions;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Assets;
use App\Models\Permission;
use Auth;
use Validator;
use Illuminate\Support\Facades\Hash;
use DB;
use Illuminate\Support\Carbon;
use Storage;
use Illuminate\Support\Facades\Log;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;
use FFMpeg\Format\Video\X264;
use FFMpeg\Coordinate\Dimension;

use App\Jobs\CompressVideo;

class GalleryController extends Controller
{
    protected $user;

    public function __construct()
    {
        //$this->apiToken = uniqid(base64_encode(Str::random(40)));
        $this->middleware('auth:api');
        $this->user = new User;
    }

    public function assets(Request $request)
    {
        $user = Auth::user();
    
        // Get the assets uploaded by the authenticated user
        $assets = Assets::where('user_id', $user->id)->get();
    
        // Define the number of items to return per page
        $perPage = 10;
        // Get the page number from the request, default to 1 for GET requests
        $page = $request->input('page', 1);        
        // Calculate the offset based on the page number and perPage
        $offset = ($page - 1) * $perPage;
    
        // Slice the files to get the paginated result
        $assetsList = $assets->slice($offset, $perPage);
    
        // Process the sliced files and create the response
        $data = [];
    
        foreach ($assetsList as $asset) {
            $data[] = [
                'id' => $asset->id,
                'filename' => $asset->filename,
                'asset_path' => $asset->asset_path,
                'file_type' =>$asset->file_type,
                'domain' => $asset->domain,
                'user_id' => $asset->user_id,                
            ];
        }
    
        return response()->json($data, 200);
    }

    public function uploadMedia(Request $request)
    {
        // Validate the incoming request
        /*       $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,webm,mp4|max:50000', // Adjust max file size if needed
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        } */

        // Handle file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');

            // Generate a unique filename
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();

            // Determine if the file is a video
            $isVideo = $file->getClientOriginalExtension() == 'mp4';

            // Move the uploaded file to the storage directory
            $path = $file->storeAs('public/photos_videos', $filename);

            Log::info('File uploaded to: ' . $path);

            $path_to_store_in_db = 'photos_videos/'.$filename;

            // Create a new record in the database
            $media = new Assets();
            $media->filename = $filename;
            $media->asset_path = $path_to_store_in_db;
            $media->file_type = $file->getClientOriginalExtension();
            $media->user_id = auth()->id(); // Assuming user is authenticated
            $media->domain = auth()->user()->domain; // Assuming domain is associated with the user

           // Save the record
           $media->save();

            // Compress video if it's a video
            if ($isVideo) {
                Log::info($path_to_store_in_db);
                dispatch(new CompressVideo($path_to_store_in_db, $filename, $media->id));    
            }

            return response()->json(['message' => 'Media uploaded successfully'], 200);
        }

        return response()->json(['error' => 'Media file not found in request'], 400);
    }

    public function deleteMedia(Request $request)
    {
        $fileName = $request->query('fileName');
        
        if (!$fileName) {
            Log::error('File name is missing in the request.');
            return response()->json(['message' => 'File name is required'], 400);
        }
    
        // Find the media record in the database
        $media = Assets::where('filename', $fileName)->first();
    
        if (!$media) {
            return response()->json(['message' => 'File not found in the database'], 404);
        }
    
        // Construct the file path
        $filePath = storage_path('app/public/' . $media->asset_path);
    
        Log::info("Attempting to delete file at path: " . $filePath);
      
        // Check if the file exists
        if (file_exists($filePath)) {
            // Attempt to delete the file
            if (unlink($filePath)) {
                // File deleted successfully, now delete the record from the database
                $media->delete();
                Log::info('File and database record deleted successfully for: ' . $fileName);
                return response()->json(['message' => 'File deleted successfully'], 200);
            } else {
                // Unable to delete the file
                return response()->json(['message' => 'File could not be deleted'], 500);
            }
        } else {
            // File not found, delete the record from the database anyway
            $media->delete();
            Log::info('File not found, but database record deleted for: ' . $fileName);
            return response()->json(['message' => 'File not found, but database record deleted'], 404);
        }
    }
    
}
 