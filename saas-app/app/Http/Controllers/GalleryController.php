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

        // Get the assets
        if ($user->role == "admin") {
            $assets = Assets::with('roles')->get();
        } else {
            $domain = DB::table('users')->select('domain')->where('id', '=', Auth::user()->id)->first();
            $assets = Assets::with('roles')->where('domain', '=', $domain->domain)->get();
        }

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

        //foreach ($assetsList as $assets) {
            $data[] = [
                'filename' => '',
                'asset_path' => '',
                'domain' => '',
                'user_id' => '',                
            ];
        //}

        return response()->json($data, 200);
    }

}
