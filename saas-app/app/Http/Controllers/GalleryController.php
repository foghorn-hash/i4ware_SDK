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
use App\Events\VideoCompressed;
use FFMpeg\Coordinate\Dimension;

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

    public function uploadMediaOLD(Request $request)
    {
        // Validate the incoming request
     /*    $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,webm,mp4|max:4096', // Adjust max file size if needed
        ]);
    
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        } */
    
        // Handle file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
    
            // Generate a unique filename
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
    
            // Move the uploaded file to the storage directory
            $path = $file->storeAs('public/photos_videos', $filename);
    
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
    
            return response()->json(['message' => 'Media uploaded successfully'], 200);
        }
    
        return response()->json(['error' => 'Media file not found in request'], 400);
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
            $isVideo = $file->getClientOriginalExtension() === 'mp4';

            // Move the uploaded file to the storage directory
            $path = $file->storeAs('public/photos_videos', $filename);

             $path_to_store_in_db = 'photos_videos/'.$filename;

            // Compress video if it's a video
            if ($isVideo) {

                Log::info('1111111');
               
                    // Define the low bitrate format
                    $lowBitrateFormat = (new X264('libmp3lame', 'libx264'))->setKiloBitrate(500);
                
                    // Open the video file
                    FFMpeg::fromDisk('public')
                        ->open($path_to_store_in_db)
                        ->addFilter(function ($filters) {
                            // Resize the video to 960x540 pixels
                            $filters->resize(new Dimension(960, 540));
                        })
                        ->export()
                        ->toDisk('public') // Change 's3' to 'public' to save it locally
                        ->inFormat($lowBitrateFormat)
                        ->save('photos_videos/compressed_'.$filename);
               
            
                //compress using command
                 /*         Log::info('222222');
                // Define the input and output paths
                $inputPath = public_path('storage/' . $path_to_store_in_db);
                $outputPath = public_path('storage/photos_videos/compressed_' . $filename);

                // Construct the ffmpeg command
                $ffmpegCommand = "ffmpeg -i $inputPath -c:v libx264 -c:a aac $outputPath";

                // Execute the ffmpeg command
                exec($ffmpegCommand, $output, $returnCode);
                Log::info('2222', [$returnCode]);
                // Check if the command executed successfully
                if ($returnCode === 0) {
                    Log::info('444444444',$output);
                    // Compression successful
                    $path_to_store_in_db = 'photos_videos/compressed_' . $filename;
                } else {
                    // Compression failed
                    // Handle the error
                } */

                //compress using package.
              /*  $video = FFMpeg::fromDisk('public')->open($path_to_store_in_db);
               
                $video->export()
                    ->inFormat(new X264('aac'))
                    ->save('photos_videos/compressed_'.$filename);

                $path_to_store_in_db = 'photos_videos/compressed_'.$filename;  */
            }

            // Create a new record in the database
            $media = new Assets();
            $media->filename = $filename;
            $media->asset_path = $path_to_store_in_db;
            $media->file_type = $file->getClientOriginalExtension();
            $media->user_id = auth()->id(); // Assuming user is authenticated
            $media->domain = auth()->user()->domain; // Assuming domain is associated with the user

            // Save the record
            $media->save();


            return response()->json(['message' => 'Media uploaded successfully'], 200);
        }

        return response()->json(['error' => 'Media file not found in request'], 400);
    }
}
