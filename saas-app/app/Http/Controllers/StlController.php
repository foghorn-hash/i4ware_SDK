<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class StlController extends Controller
{

    public function __construct()
    {
        //$this->apiToken = uniqid(base64_encode(Str::random(40)));
        $this->middleware('auth:api');
    }

    /**
     * Build cross-platform command for running Python scripts with display
     */
    private function buildCrossPlatformCommand($scriptName, $filename)
    {
        $scriptPath = base_path('scripts/' . $scriptName);

        // Detect operating system
        $os = PHP_OS_FAMILY;

        switch ($os) {
            case 'Linux':
                // Ubuntu/Linux - use xvfb-run for virtual display
                $pythonPath = env('PYTHON_PATH', '/home/ubuntu/miniconda3/envs/cad/bin/python');
                $xvfbPath = env('XVFB_PATH', '/usr/bin/xvfb-run');
                return [$xvfbPath, '-a', $pythonPath, $scriptPath, $filename];

            case 'Darwin':
                // macOS - try different Python paths in order of preference
                $pythonPath = env('PYTHON_PATH');
                if (!$pythonPath) {
                    // Try common Python paths on macOS
                    $possiblePaths = [
                        '/opt/homebrew/bin/python3',
                        '/usr/bin/python3',
                        '/opt/anaconda3/bin/python',
                        '/usr/local/bin/python3',
                        'python3'
                    ];

                    foreach ($possiblePaths as $path) {
                        if ($path === 'python3' || file_exists($path)) {
                            $pythonPath = $path;
                            break;
                        }
                    }
                }
                return [$pythonPath ?: 'python3', $scriptPath, $filename];

            case 'Windows':
                // Windows - use python directly
                $pythonPath = env('PYTHON_PATH', 'python');
                return [$pythonPath, $scriptPath, $filename];

            default:
                // Fallback to direct python execution
                $pythonPath = env('PYTHON_PATH', 'python3');
                return [$pythonPath, $scriptPath, $filename];
        }
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
        
        $deletedFiles = 0;
        $failedFiles = [];

        // Delete STL file if it exists
        if (file_exists($filePath)) {
            if (unlink($filePath)) {
                $deletedFiles++;
                Log::info("Successfully deleted STL file: " . $filePath);
            } else {
                $failedFiles[] = 'STL file';
                Log::error("Failed to delete STL file: " . $filePath);
            }
        } else {
            Log::warning("STL file not found: " . $filePath);
        }

        // Delete screenshot file if it exists
        if (file_exists($fileScreenshotPath)) {
            if (unlink($fileScreenshotPath)) {
                $deletedFiles++;
                Log::info("Successfully deleted screenshot file: " . $fileScreenshotPath);
            } else {
                $failedFiles[] = 'Screenshot file';
                Log::error("Failed to delete screenshot file: " . $fileScreenshotPath);
            }
        } else {
            Log::warning("Screenshot file not found: " . $fileScreenshotPath);
        }

        // Return appropriate response
        if ($deletedFiles > 0) {
            if (count($failedFiles) > 0) {
                return response()->json([
                    'message' => 'Some files deleted successfully, but failed to delete: ' . implode(', ', $failedFiles),
                    'deleted_files' => $deletedFiles
                ], 200);
            } else {
                return response()->json([
                    'message' => 'Files deleted successfully',
                    'deleted_files' => $deletedFiles
                ], 200);
            }
        } else {
            return response()->json(['message' => 'No files found to delete'], 404);
        }
    }

    public function generateSpaceship(Request $request)
    {
        $filename = (string) time();

        // Ensure a writable Mesa shader cache to stop the permission warning
        $mesaCache = storage_path('app/mesa-cache');
        if (!is_dir($mesaCache)) {
            @mkdir($mesaCache, 0775, true);
        }

        // Cross-platform process command building
        $command = $this->buildCrossPlatformCommand('spaceship.py', $filename);
        $process = new Process($command);
        $process->setEnv([
            'LIBGL_ALWAYS_SOFTWARE' => '1',
            'QT_QPA_PLATFORM'       => 'offscreen',
            // push Mesa cache to a writable place (prevents the first warning line)
            'MESA_GLSL_CACHE_DIR'   => $mesaCache,
            // optional noise reducers
            'QT_LOGGING_RULES'      => '*.debug=false;qt.qpa.*=false',
            'GALLIUM_DRIVER'        => 'llvmpipe',
        ]);
        $process->setTimeout(120);
        $process->run();

        if (!$process->isSuccessful()) {
            $errorOutput = trim($process->getErrorOutput() ?: $process->getOutput());
            Log::error('Python failed', [
                'stderr' => $process->getErrorOutput(),
                'stdout' => $process->getOutput(),
                'command' => implode(' ', $command),
            ]);

            // Check for common Python issues and provide helpful error messages
            if (strpos($errorOutput, 'python: not found') !== false) {
                $errorOutput = 'Python not found. Please install Python 3 or set PYTHON_PATH in .env file.';
            } elseif (strpos($errorOutput, "No module named 'OCC'") !== false) {
                $errorOutput = 'OpenCascade (OCC) Python libraries not installed. Please install: pip install python-opencascade';
            } elseif (strpos($errorOutput, 'exec: python: not found') !== false) {
                $errorOutput = 'Python executable not found. Try installing Python 3 or setting PYTHON_PATH environment variable.';
            }

            return response()->json([
                'ok'    => false,
                'error' => $errorOutput,
            ], 500);
        }

        $raw = trim($process->getOutput());

        // Extract the last valid JSON object from noisy stdout
        $jsonOutput = null;
        foreach (array_reverse(preg_split("/\r?\n/", $raw)) as $line) {
            $line = trim($line);
            if ($line !== '' && $line[0] === '{' && substr($line, -1) === '}') {
                $decoded = json_decode($line, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $jsonOutput = $decoded;
                    break;
                }
            }
        }

        if (!$jsonOutput || empty($jsonOutput['stl_filename'])) {
            Log::error('Invalid JSON from Python', ['raw' => $raw]);
            return response()->json([
                'success'    => false,
                'error' => 'Python did not return clean JSON',
                'raw'   => $raw, // keep for debugging
            ], 500);
        }

        // Read screenshot via the public disk (storage/app/public)
        $public = Storage::disk('public');
        $shotRel = "stl-screenshots/screenshot_{$filename}.png";
        $screenshotBase64 = $public->exists($shotRel) ? base64_encode($public->get($shotRel)) : null;

        return response()->json([
            'success'              => true,
            'stl_filename'    => $jsonOutput['stl_filename'],
            'stl_url'         => asset("storage/stl-files/{$jsonOutput['stl_filename']}.stl"),
            'screenshot_file' => $screenshotBase64, // null if screenshot failed
        ]);
    }

    public function generateCyborg(Request $request)
    {
        $filename = (string) time();

        // Ensure a writable Mesa shader cache to stop the permission warning
        $mesaCache = storage_path('app/mesa-cache');
        if (!is_dir($mesaCache)) {
            @mkdir($mesaCache, 0775, true);
        }

        // Cross-platform process command building
        $command = $this->buildCrossPlatformCommand('cyborg.py', $filename);
        $process = new Process($command);
        $process->setEnv([
            'LIBGL_ALWAYS_SOFTWARE' => '1',
            'QT_QPA_PLATFORM'       => 'offscreen',
            // push Mesa cache to a writable place (prevents the first warning line)
            'MESA_GLSL_CACHE_DIR'   => $mesaCache,
            // optional noise reducers
            'QT_LOGGING_RULES'      => '*.debug=false;qt.qpa.*=false',
            'GALLIUM_DRIVER'        => 'llvmpipe',
        ]);
        $process->setTimeout(120);
        $process->run();

        if (!$process->isSuccessful()) {
            $errorOutput = trim($process->getErrorOutput() ?: $process->getOutput());
            Log::error('Python failed', [
                'stderr' => $process->getErrorOutput(),
                'stdout' => $process->getOutput(),
                'command' => implode(' ', $command),
            ]);

            // Check for common Python issues and provide helpful error messages
            if (strpos($errorOutput, 'python: not found') !== false) {
                $errorOutput = 'Python not found. Please install Python 3 or set PYTHON_PATH in .env file.';
            } elseif (strpos($errorOutput, "No module named 'OCC'") !== false) {
                $errorOutput = 'OpenCascade (OCC) Python libraries not installed. Please install: pip install python-opencascade';
            } elseif (strpos($errorOutput, 'exec: python: not found') !== false) {
                $errorOutput = 'Python executable not found. Try installing Python 3 or setting PYTHON_PATH environment variable.';
            }

            return response()->json([
                'ok'    => false,
                'error' => $errorOutput,
            ], 500);
        }

        $raw = trim($process->getOutput());

        // Extract the last valid JSON object from noisy stdout
        $jsonOutput = null;
        foreach (array_reverse(preg_split("/\r?\n/", $raw)) as $line) {
            $line = trim($line);
            if ($line !== '' && $line[0] === '{' && substr($line, -1) === '}') {
                $decoded = json_decode($line, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $jsonOutput = $decoded;
                    break;
                }
            }
        }

        if (!$jsonOutput || empty($jsonOutput['stl_filename'])) {
            Log::error('Invalid JSON from Python', ['raw' => $raw]);
            return response()->json([
                'success'    => false,
                'error' => 'Python did not return clean JSON',
                'raw'   => $raw, // keep for debugging
            ], 500);
        }

        // Read screenshot via the public disk (storage/app/public)
        $public = Storage::disk('public');
        $shotRel = "stl-screenshots/screenshot_{$filename}.png";
        $screenshotBase64 = $public->exists($shotRel) ? base64_encode($public->get($shotRel)) : null;

        return response()->json([
            'success'              => true,
            'stl_filename'    => $jsonOutput['stl_filename'],
            'stl_url'         => asset("storage/stl-files/{$jsonOutput['stl_filename']}.stl"),
            'screenshot_file' => $screenshotBase64, // null if screenshot failed
        ]);
    }

    public function generateCar(Request $request)
    {
        $filename = (string) time();

        // Ensure a writable Mesa shader cache to stop the permission warning
        $mesaCache = storage_path('app/mesa-cache');
        if (!is_dir($mesaCache)) {
            @mkdir($mesaCache, 0775, true);
        }

        // Cross-platform process command building
        $command = $this->buildCrossPlatformCommand('sportcar.py', $filename);
        $process = new Process($command);
        $process->setEnv([
            'LIBGL_ALWAYS_SOFTWARE' => '1',
            'QT_QPA_PLATFORM'       => 'offscreen',
            // push Mesa cache to a writable place (prevents the first warning line)
            'MESA_GLSL_CACHE_DIR'   => $mesaCache,
            // optional noise reducers
            'QT_LOGGING_RULES'      => '*.debug=false;qt.qpa.*=false',
            'GALLIUM_DRIVER'        => 'llvmpipe',
        ]);
        $process->setTimeout(120);
        $process->run();

        if (!$process->isSuccessful()) {
            $errorOutput = trim($process->getErrorOutput() ?: $process->getOutput());
            Log::error('Python failed', [
                'stderr' => $process->getErrorOutput(),
                'stdout' => $process->getOutput(),
                'command' => implode(' ', $command),
            ]);

            // Check for common Python issues and provide helpful error messages
            if (strpos($errorOutput, 'python: not found') !== false) {
                $errorOutput = 'Python not found. Please install Python 3 or set PYTHON_PATH in .env file.';
            } elseif (strpos($errorOutput, "No module named 'OCC'") !== false) {
                $errorOutput = 'OpenCascade (OCC) Python libraries not installed. Please install: pip install python-opencascade';
            } elseif (strpos($errorOutput, 'exec: python: not found') !== false) {
                $errorOutput = 'Python executable not found. Try installing Python 3 or setting PYTHON_PATH environment variable.';
            }

            return response()->json([
                'ok'    => false,
                'error' => $errorOutput,
            ], 500);
        }

        $raw = trim($process->getOutput());

        // Extract the last valid JSON object from noisy stdout
        $jsonOutput = null;
        foreach (array_reverse(preg_split("/\r?\n/", $raw)) as $line) {
            $line = trim($line);
            if ($line !== '' && $line[0] === '{' && substr($line, -1) === '}') {
                $decoded = json_decode($line, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $jsonOutput = $decoded;
                    break;
                }
            }
        }

        if (!$jsonOutput || empty($jsonOutput['stl_filename'])) {
            Log::error('Invalid JSON from Python', ['raw' => $raw]);
            return response()->json([
                'success'    => false,
                'error' => 'Python did not return clean JSON',
                'raw'   => $raw, // keep for debugging
            ], 500);
        }

        // Read screenshot via the public disk (storage/app/public)
        $public = Storage::disk('public');
        $shotRel = "stl-screenshots/screenshot_{$filename}.png";
        $screenshotBase64 = $public->exists($shotRel) ? base64_encode($public->get($shotRel)) : null;

        return response()->json([
            'success'              => true,
            'stl_filename'    => $jsonOutput['stl_filename'],
            'stl_url'         => asset("storage/stl-files/{$jsonOutput['stl_filename']}.stl"),
            'screenshot_file' => $screenshotBase64, // null if screenshot failed
        ]);

    }

}
