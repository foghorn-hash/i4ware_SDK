<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\RolePermissions;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Domain;
use App\Models\Permission;
use App\Models\UserVerify;
use Auth;
use Validator;
use Illuminate\Support\Facades\Hash;
use DB;
use Illuminate\Support\Carbon;
use Storage;
use Illuminate\Support\Facades\Log;

class UsersController extends Controller
{
    protected $user;

    public function __construct()
    {
        //$this->apiToken = uniqid(base64_encode(Str::random(40)));
        $this->middleware('auth:api');
        $this->user = new User;
    }

    public function users(Request $request)
    {
        $user = Auth::user();

        if ($user->role == "admin") {
            $users = User::with('roles')->get();
        } else {
            $domain = DB::table('users')->select('domain')->where('id', '=', Auth::user()->id)->first();
            $users = User::with('roles')->where('domain', '=', $domain->domain)->get();
        }

        Log::info('Users:', ['users' => $users]);

        // Log the initial value of the 'page' parameter
        Log::info('Initial Page parameter:', ['page' => $request->input('page')]);
        // Define the number of items to return per page
        $perPage = 10;
        // Get the page number from the request, default to 1 for GET requests
        $page = $request->input('page', 1);        
        // Calculate the offset based on the page number and perPage
        $offset = ($page - 1) * $perPage;

        // Slice the files to get the paginated result
        $userList = $users->slice($offset, $perPage);

        Log::info('User List:', ['userList' => $userList]);

        // Process the sliced files and create the response
        $data = [];

        foreach ($userList as $user) {
            $data[] = [
                'name' => $user->name,
                'email' => $user->email,
                'profile_picture_path' => $user->profile_picture_path,
                'domain' => $user->domain,
                'email_verified_at' => $user->email_verified_at,
                'is_active' => $user->is_active,
                'id' => $user->id,
                'roles' => $user->roles->name,
                'gender' => $user->gender,
            ];
        }

        Log::info('Response List:', ['data' => $data]);

        return response()->json($data, 200);
    }

    function usersChangeStatus(Request $request){
        
        $id = $request->id;

        $user = User::where('id', $id)->first();

        $user->is_active = $user->is_active === 1 ? false : true;
        $user->save();

        return response()->json([
            'success' => true
        ], 200);
    }

    function usersVerify(Request $request){
        
        $id = $request->id;

        $user = User::where('id', $id)->first();

        $user->email_verified_at = date('Y-m-d H:i:s');
        $user->save();

        UserVerify::where('user_id', $id)->update([
            'verified' => 1,
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        return response()->json([
            'success' => true
        ], 200);
    }

    function usersChangePassword(Request $request){
        
        $id = $request->id;
        $password = $request->password;


        $user = User::where('id', $id)->first();

        $user->password = Hash::make($password);
        $user->save();

        return response()->json([
            'success' => true
        ], 200);
    }

    function usersAdd(Request $request){
        
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'email' => 'required|string|unique:users|email',
            'name' => 'required|string',
            'role' => 'required|string',
            'password' => 'required|min:8',
        ]);

        if ($validator->fails()) {
			$error = $validator->errors();
			return response()->json([
				'success' => false,
				'data' => $error
			], 200);
		}
        if ($request->role=="NULL") {
            $role = NULL;
        } else {
            $role = $request->role;
        }
        DB::table('users')->insert([
            ['name' => $request->name, 'gender' => $request->gender, 'email' => $request->email, 'email_verified_at' => date('Y-m-d H:i:s'), 'password' => Hash::make($request->password), 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s'), 'domain' => $user->domain, 'role' => 'user', 'role_id' => $role]
        ]);
        return response()->json([
            'success' => true,
            'data' => []
        ], 200);
        
    }  

}
