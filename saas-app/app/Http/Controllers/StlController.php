<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class StlController extends Controller
{

    public function __construct()
    {
        //$this->apiToken = uniqid(base64_encode(Str::random(40)));
        $this->middleware('auth:api');
    }

    public function uploadStlFile(Request $request)
    {
        /*
        try {
            $request->validate([
                'screenshot' => 'required|file|mimes:png,jpg,jpeg',
            ], [
                'screenshot.required' => 'The screenshot file is required.',
                'screenshot.file' => 'The screenshot file must be a valid file.',
                'screenshot.mimes' => 'The screenshot file must be in PNG, JPG, or JPEG format.'
            ]);
        
            // Your file processing logic here...
        
            // If everything is successful, return a response
        
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log validation errors
            Log::error('Validation failed: ' . $e->getMessage());
        
            // Return a response with validation errors
            return response()->json(['error' => 'Validation failed.', 'errors' => $e->errors()], 400);
        }*/

        // Validate that the "file" and "screenshot" parameters are present
        if (!$request->hasFile('file') || !$request->has('screenshot')) {
        // Log a custom error message
            error_log("Validation failed: 'file' and 'screenshot' parameters are required.");
            // Return a response with an error message
            return response()->json(['error' => 'Validation failed: file and screenshot parameters are required.'], 400);
        }

        $uploadedFile = $request->file('file');
        $time = time(); // $time will be used again with the screenshot filename
        $fileName = $time . '.' . $uploadedFile->getClientOriginalExtension();

        //SCREENSHOTS:

        // Receive the data URL from the frontend
        $screenshotDataUrl = $request->input('screenshot');
        // Remove the "data:image/png;base64," prefix to get the base64-encoded image data
        $screenshotData = substr($screenshotDataUrl, strpos($screenshotDataUrl, ',') + 1);
        // Decode the base64-encoded image data to binary
        $screenshotBinaryData = base64_decode($screenshotData);
        // Generate a unique filename or use a predefined one
        $filename = 'screenshot_' . $time . '.png';           
        // Specify the storage path and save the binary image data
        Storage::put('public/stl-screenshots/' . $filename, $screenshotBinaryData);

        //store the files
        $uploadedFile->storeAs('stl-files', $fileName, 'public');

        // Return a response with the file URLs and other relevant data
        return response()->json([
            'message' => 'File uploaded successfully', 
            'fileName' => $time
            //'screenshot' => asset('storage/stl-screenshots' .$fileName)
        ]);
    }

    public function getStlItems(Request $request)
    {
         // Log the initial value of the 'page' parameter
        Log::info('Initial Page parameter:', ['page' => $request->input('page')]);
        // Define the number of items to return per page
        $perPage = 9;
        // Get the page number from the request, default to 1 for GET requests
        $page = $request->input('page', 1);        
        // Calculate the offset based on the page number and perPage
        $offset = ($page - 1) * $perPage; 
        // Get the list of STL files from the storage directory
        $stlFiles = Storage::files('public/stl-files');
        // Filter out the .DS_Store file if present
        $stlFiles = array_filter($stlFiles, function ($file) {
            return strpos($file, '.DS_Store') === false;
        });
        // Slice the files to get the paginated result
        $fileList = array_slice($stlFiles, $offset, $perPage);
        // Process the sliced files and create the response
        $responseList = [];
    
        foreach ($fileList as $file) {
            $fileName = pathinfo($file, PATHINFO_FILENAME);
    
            // Construct the path to the corresponding screenshot image
            $screenshotPath = 'public/stl-screenshots/screenshot_' . $fileName . '.png';
    
            $screenshotFile = null;
    
            // Check if the screenshot image exists
            if (Storage::exists($screenshotPath)) {
                // Get the content of the screenshot image
                $screenshotFile = base64_encode(Storage::get($screenshotPath));
            }
    
            $responseList[] = [
                'stl_filename' => $fileName,
                'stl_url' => $_ENV["APP_ASSET_URL"] . "/stl-files/" . $fileName . ".stl",
                'screenshot_file' => $screenshotFile // Screenshot image file
            ];
        }
    
        // Return the paginated list of STL files with screenshot file in the JSON response
        return response()->json($responseList);
    }
    
    public function getStlItem(Request $request) {
        // Get the filename from the request
        $fileName = $request->query('fileName');

        // Construct the path to the corresponding STL file
        $stlFilePath = 'public/stl-files/' . $fileName . '.stl';

        // Check if the STL file exists
        if (Storage::exists($stlFilePath)) {
            // Get the content of the STL file
            $stlFile = base64_encode(Storage::get($stlFilePath));

            // Construct the path to the corresponding screenshot image
            $screenshotPath = 'public/stl-screenshots/screenshot_' . $fileName . '.png';

            $screenshotFile = null;

            // Check if the screenshot image exists
            if (Storage::exists($screenshotPath)) {
                // Get the content of the screenshot image
                $screenshotFile = base64_encode(Storage::get($screenshotPath));
            }

            $response = [
                'stl_filename' => $fileName,
                'stl_file' => $stlFile,
                'screenshot_file' => $screenshotFile, // Screenshot image file
            ];

            return response()->json($response);
        } else {
            return response()->json(['error' => 'STL file not found'], 404);
        }
    }

    public function getStlFile(Request $request)
    {
        // Get the filename from the request (without extensions)
        $filenameWithoutExtension = $request->input('filenameWithoutExtension');
    
        // Construct the full path to the STL file based on the provided filename
        $stlFilePath = "public/stl-files/" . $filenameWithoutExtension . ".stl"; 
        //Log::info("The value of the variable is: " . $stlFilePath);

        // Check if the file exists in storage
        if (Storage::exists($stlFilePath)) {
            // Get the file's contents as a binary string
            $stlFileContents = Storage::get($stlFilePath);
    
            // Encode the binary string as base64
            //$stlFileBase64 = base64_encode($stlFileContents);
    
            // Define the response headers for downloading
            $headers = [
                'Content-Type' => 'application/octet-stream',
                'Content-Disposition' => 'attachment; filename="' . $filenameWithoutExtension . '.stl"',
            ];

            // Return the base64-encoded STL file in the response
            return response($stlFileContents, 200, $headers);
        } else {
            // File not found
            return response()->json(['error' => 'File not found'], 404);
        }
    }

    public function postStlDeleteFile(Request $request) 
    {
        $fileName = $request->query('fileName');
        if (!$fileName) {
            Log::error('File name is missing in the request.');
            return response()->json(['message' => 'File name is required'], 400);
        } 
        
        $filePath = public_path('storage/stl-files/' . $fileName . '.stl');

        $fileScreenshotPath = public_path('storage/stl-screenshots/screenshot_' . $fileName . '.png');

        Log::info("Attempting to delete file at path: " . $filePath);
        Log::info("Attempting to delete screenshot at path: " . $fileScreenshotPath);
        
        if (file_exists($filePath) && file_exists($fileScreenshotPath)) {
            if (unlink($filePath) && unlink($fileScreenshotPath)) {
                return response()->json(['message' => 'File deleted successfully'], 200);
            } else {
                return response()->json(['message' => 'File could not be deleted'], 500);
            }
        } else {
            return response()->json(['message' => 'File not found'], 404);
        }
    }

    public function generateSpaceship(Request $request)
    {
        $filename = time();
        $pythonPath = 'C:\Users\matti\Miniconda3\envs\pyoccenv\python.exe'; // your Python path
        $pythonScript = base_path('scripts/spaceship.py');
        $command = "\"$pythonPath\" \"$pythonScript\" $filename";

        // Capture output and exit code
        exec($command, $output, $exitCode);

        // Debug: Log all output
        Log::info("Raw Python output", ['output' => $output, 'exit_code' => $exitCode]);

        // Find the last line that looks like valid JSON
        $jsonOutput = null;
        foreach (array_reverse($output) as $line) {
            $decoded = json_decode($line, true);
            if (is_array($decoded)) {
                $jsonOutput = $decoded;
                break;
            }
        }

        if (!$jsonOutput || !isset($jsonOutput['stl_filename'])) {
            Log::error("Python script returned invalid result", ['json' => $jsonOutput, 'full_output' => $output]);
            return response()->json([
                'error' => 'Failed to generate model',
                'details' => 'Invalid response from script'
            ], 500);
        }

        // Optional: fail if script returned error explicitly
        if (isset($jsonOutput['success']) && $jsonOutput['success'] === false) {
            Log::error("Python generation failed", [
                'error' => $jsonOutput['error'] ?? 'unknown',
                'traceback' => $jsonOutput['traceback'] ?? null
            ]);

            return response()->json([
                'error' => 'Failed to generate model',
                'details' => $jsonOutput['error'] ?? 'Unknown error'
            ], 500);
        }

        // Success: build response with base64 screenshot
        $screenshotPath = "public/stl-screenshots/screenshot_{$filename}.png";
        $screenshotBase64 = Storage::exists($screenshotPath)
            ? base64_encode(Storage::get($screenshotPath))
            : null;

        return response()->json([
            'stl_filename' => $jsonOutput['stl_filename'],
            'stl_url' => asset("storage/stl-files/{$jsonOutput['stl_filename']}.stl"),
            'screenshot_file' => $screenshotBase64,
        ]);
    }

    public function generateCyborg(Request $request)
    {
        $filename = time();
        $pythonPath = 'C:\Users\matti\Miniconda3\envs\pyoccenv\python.exe'; // your Python path
        $pythonScript = base_path('scripts/cyborg.py');
        $command = "\"$pythonPath\" \"$pythonScript\" $filename";

        // Capture output and exit code
        exec($command, $output, $exitCode);

        // Debug: Log all output
        Log::info("Raw Python output", ['output' => $output, 'exit_code' => $exitCode]);

        // Find the last line that looks like valid JSON
        $jsonOutput = null;
        foreach (array_reverse($output) as $line) {
            $decoded = json_decode($line, true);
            if (is_array($decoded)) {
                $jsonOutput = $decoded;
                break;
            }
        }

        if (!$jsonOutput || !isset($jsonOutput['stl_filename'])) {
            Log::error("Python script returned invalid result", ['json' => $jsonOutput, 'full_output' => $output]);
            return response()->json([
                'error' => 'Failed to generate model',
                'details' => 'Invalid response from script'
            ], 500);
        }

        // Optional: fail if script returned error explicitly
        if (isset($jsonOutput['success']) && $jsonOutput['success'] === false) {
            Log::error("Python generation failed", [
                'error' => $jsonOutput['error'] ?? 'unknown',
                'traceback' => $jsonOutput['traceback'] ?? null
            ]);

            return response()->json([
                'error' => 'Failed to generate model',
                'details' => $jsonOutput['error'] ?? 'Unknown error'
            ], 500);
        }

        // Success: build response with base64 screenshot
        $screenshotPath = "public/stl-screenshots/screenshot_{$filename}.png";
        $screenshotBase64 = Storage::exists($screenshotPath)
            ? base64_encode(Storage::get($screenshotPath))
            : null;

        return response()->json([
            'stl_filename' => $jsonOutput['stl_filename'],
            'stl_url' => asset("storage/stl-files/{$jsonOutput['stl_filename']}.stl"),
            'screenshot_file' => $screenshotBase64,
        ]);
    }

    public function generateCar(Request $request)
    {
        $filename = time();
        $pythonPath = 'C:\Users\matti\Miniconda3\envs\pyoccenv\python.exe'; // your Python path
        $pythonScript = base_path('scripts/sportcar.py');
        $command = "\"$pythonPath\" \"$pythonScript\" $filename";

        // Capture output and exit code
        exec($command, $output, $exitCode);

        // Debug: Log all output
        Log::info("Raw Python output", ['output' => $output, 'exit_code' => $exitCode]);

        // Find the last line that looks like valid JSON
        $jsonOutput = null;
        foreach (array_reverse($output) as $line) {
            $decoded = json_decode($line, true);
            if (is_array($decoded)) {
                $jsonOutput = $decoded;
                break;
            }
        }

        if (!$jsonOutput || !isset($jsonOutput['stl_filename'])) {
            Log::error("Python script returned invalid result", ['json' => $jsonOutput, 'full_output' => $output]);
            return response()->json([
                'error' => 'Failed to generate model',
                'details' => 'Invalid response from script'
            ], 500);
        }

        // Optional: fail if script returned error explicitly
        if (isset($jsonOutput['success']) && $jsonOutput['success'] === false) {
            Log::error("Python generation failed", [
                'error' => $jsonOutput['error'] ?? 'unknown',
                'traceback' => $jsonOutput['traceback'] ?? null
            ]);

            return response()->json([
                'error' => 'Failed to generate model',
                'details' => $jsonOutput['error'] ?? 'Unknown error'
            ], 500);
        }

        // Success: build response with base64 screenshot
        $screenshotPath = "public/stl-screenshots/screenshot_{$filename}.png";
        $screenshotBase64 = Storage::exists($screenshotPath)
            ? base64_encode(Storage::get($screenshotPath))
            : null;

        return response()->json([
            'stl_filename' => $jsonOutput['stl_filename'],
            'stl_url' => asset("storage/stl-files/{$jsonOutput['stl_filename']}.stl"),
            'screenshot_file' => $screenshotBase64,
        ]);
    }

}
