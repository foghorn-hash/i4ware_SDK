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

class ProfileController extends Controller
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

    public function domains(Request $request)
    {
        $user = Auth::user();
    
        if ($user->role == "admin") {
            $domains = Domain::all();
        } else {
            $domain = DB::table('users')->select('domain')->where('id', '=', Auth::user()->id)->first();
            $domains = Domain::where('domain', '=', $domain->domain)->get();
        }
    
        Log::info('Domains:', ['domains' => $domains]);
    
        $perPage = 10;

        $page = $request->input('page', 1);

        $offset = ($page - 1) * $perPage;
    
        $domainList = $domains->slice($offset, $perPage);
    
        Log::info('Domain List:', ['domainList' => $domainList]);
    
        $data = [];
    
        foreach ($domainList as $domain) {
            $data[] = [
                'id' => $domain->id,
                'domain' => $domain->domain,
                'valid_before_at' => $domain->valid_before_at,
                'type' => $domain->type,
                'company_name' => $domain->company_name,
                'vat_id' => $domain->vat_id,
                'mobile_no' => $domain->mobile_no,
                'technical_contact_email' => $domain->technical_contact_email,
                'billing_contact_email' => $domain->billing_contact_email,
                'country' => $domain->country
            ];
            
        }
    
        Log::info('Response List:', ['data' => $data]);
    
        return response()->json($data, 200);
    }
    
    public function updateDomain(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'domain' => 'required|unique:domains,domain,' . $request->id,
            'technical_contact_email' => 'required|email',
            'billing_contact_email' => 'required|email',
            'mobile_no' => 'required',
            'company_name' => 'required',
            'address_line_1' => 'required',
            'city' => 'required',
            'country' => 'required',
            'zip' => 'required',
        ]);

        if ($validator->fails()) {
            $error = $validator->errors();
            return response()->json([
                'success' => false,
                'data' => $error
            ], 200);
        }

        if ($request->id) {
            // update
            $domain = DB::table('domains')
                ->where('id', $request->id)
                ->update([
                    "technical_contact_email" => $request->technical_contact_email,
                    "billing_contact_email" => $request->billing_contact_email,
                    "mobile_no" => $request->mobile_no,
                    "company_name" => $request->company_name,
                    "address_line_1" => $request->address_line_1,
                    "address_line_2" => $request->address_line_2,
                    "city" => $request->city,
                    "country" => $request->country,
                    "zip" => $request->zip,
                    "vat_id" => $request->vat_id,
                ]);

        } else {
            // insert
            $domain = DB::table('domains')
                ->insert([
                    "domain" => $request->domain,
                    "technical_contact_email" => $request->technical_contact_email,
                    "billing_contact_email" => $request->billing_contact_email,
                    "mobile_no" => $request->mobile_no,
                    "company_name" => $request->company_name,
                    "address_line_1" => $request->address_line_1,
                    "address_line_2" => $request->address_line_2,
                    "city" => $request->city,
                    "country" => $request->country,
                    'valid_before_at' => date('Y-m-d H:i:s', strtotime("+30 day")),
                    "type" => 'trial',
                    "zip" => $request->zip,
                    "user_id" => $user->id
                ]);
        }

        return response()->json([
            'success' => true,
            'data' => $domain
        ], 200);
    }

    public function removeDomain(Request $request)
    {
        $id = $request->id;
        $user = Auth::user();

        $domain = DB::table('domains')
            ->where(['id' => $request->id])->delete();

        return response()->json([
            'success' => true,
            'data' => []
        ], 200);
    }

    public function updateDomainRecord(Request $request)
    {
        $id = $request->id;
        $action = $request->action;

        $user = Auth::user();

        $domain = Domain::where(['id' => $request->id])->first();

        switch ($action) {
            case 'extend-trial':
                $validate = Carbon::parse($domain->valid_before_at);
                $validate->addDays(30);
                $domain->valid_before_at = $validate;
                break;
            case 'make-paid':
                $domain->type = 'paid';
                break;
            case 'down-to-trial':
                $domain->type = 'trial';
                break;
            case 'extend-one-year':
                $validate = Carbon::parse($domain->valid_before_at);
                $validate->addYear(1);
                $domain->valid_before_at = $validate;
                break;
            case 'terminate':
                $domain->valid_before_at = Carbon::now()->subDays(1);
                break;
            default:
                # code...
                break;
        }
        $domain->save();

        return response()->json([
            'success' => true,
            'data' => $domain
        ], 200);
    }

    public function updateSettings(Request $request)
    {
        $user = Auth::user();

        $settingFound = DB::table('settings')->where('setting_key', '=', $request->setting_key )->get();

        if (count($settingFound) == 1) {
            $domain = DB::table('settings')->updateOrInsert(['setting_key' => $request->setting_key], [
                "setting_key" => $request->setting_key,
                "setting_value" => $request->setting_value,
                "updated_at" => Carbon::now(),
            ]);

        } else {
            $domain = DB::table('settings')->updateOrInsert(['setting_key' => $request->setting_key], [
                "setting_key" => $request->setting_key,
                "setting_value" => $request->setting_value,
                "created_at" => Carbon::now(),
                "updated_at" => Carbon::now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $domain
        ], 200);
    }

    // get all permissions
    public function permissions(Request $request)
    {
        $user = Auth::user();
        $roleId = $request->roleId;
        if (is_null($roleId)) {
            
            if ($user->role_id == 1) { 
                $permissions = Permission::select("*")->get();
            } else { 
                $permissions = Permission::select("*")->where('domain', '=', null)->get();
            }

            return response()->json([
                'success' => true,
                'data' => $permissions
            ], 200);
        } else {
            if ($user->role_id == 1) { 
                $permissions = Permission::select("*")->get();
            } else { 
                $permissions = Permission::select("*")->where('domain', '=', null)->get();
            }
            $rolesPersmissions = Role::where(['id' => $roleId])->first();
            $allowedPermissions = $rolesPersmissions->permissions;
            // dd($rolesPersmissions->permissions());
            return response()->json([
                'success' => true,
                'data' => $permissions,
                'allowedPermissions' => $allowedPermissions
            ], 200);
        }
    }

    public function roles(Request $request)
    {
        $user = Auth::user();
    
        if ($user->role == "admin") {
            $roles = Role::all();
        } else {
            $roles = Role::where('domain', '=', $user->domain)->get();
        }
    
        Log::info('Roles:', ['roles' => $roles]);
    
        $perPage = 10;

        $page = $request->input('page', 1);

        $offset = ($page - 1) * $perPage;
    
        $roleList = $roles->slice($offset, $perPage);
    
        Log::info('Role List:', ['roleList' => $roleList]);
    
        $data = [];
    
        foreach ($roleList as $role) {
            $data[] = [
                'id' => $role->id,
                'name' => $role->name,
                'domain' => $role->domain,
            ];
        }
    
        Log::info('Response List:', ['data' => $data]);
    
        return response()->json($data, 200);
    }
    
    public function rolesAll()
    {
        $user = Auth::user();
        
        $roles = Role::where('domain', '=', $user->domain)->get();
        
        return response()->json($roles, 200);
    }

    // add roles
    public function roleAdd(Request $request)
    {
        $domain = Auth::user()->domain;

        if(isset($request->id)) {
            $roles = Role::updateOrInsert([
                'id' => $request->id,
            ],[
                "name" => $request->name,
                "isActive" => true,
                "domain" => $domain,
            ]);    
        } else {
            $roles = Role::create([
                "name" => $request->name,
                "isActive" => true,
                "domain" => $domain,
            ]);
        }

        $permissions = $request->permissions;

        if(isset($request->id)){
            $roleId = $request->id;
        } else {
            $roleId = $roles->id;
        }
        RolePermissions::where(["role_id" => $roleId])->delete();

        for ($i = 0; $i < count($permissions); $i++) {
            
            RolePermissions::updateOrInsert([
                "role_id" => $roleId,
                "permission_id" => $permissions[$i],
            ], [
                "role_id" => $roleId,
                "permission_id" => $permissions[$i],
            ]);
        }


        return response()->json([
            'success' => true,
            'data' => $roles
        ], 200);
    }
    
    // delete roles
    public function roleDelete(Request $request)
    {
        // $roles = Role::remove();
        $roleId = $request->id;

        RolePermissions::where(["role_id" => $roleId])->delete();
        Role::where(["id" => $roleId])->delete();
        $roles = Role::paginate(10);
        return response()->json([
            'success' => $roleId,
            'data' => $roles
        ], 200);
    }

    public function setRole(Request $request)
    {
        $roleId = $request->roleId;
        $userid = $request->userid;

        if ($roleId=="NULL") {
            $roleId = NULL;
        } else {
            $roleId = $roleId;
        }
        
        // update user role 
        User::where(['id' => $userid])->update(['role_id' => $roleId]);

        return response()->json([
            'success' => true,
        ], 200);
    }

    public function myprofileSave(Request $request){

        $auth = Auth::user();
    
        $user = User::where(['id' => $auth->id])->first();
        $gender = User::where(['gender' => $auth->id])->first();
        $profile_picture_is_null = User::where(['profile_picture_path' => $auth->id])->first();
        $file = $request->file('file');
    
        if($file){
    
            $filename = uniqid() . '.' . $file->getClientOriginalExtension();
    
            try {
                if($user->profile_picture_path){
                    Storage::delete($user->profile_picture_path);
                }
            } catch (\Throwable $th) {
                //throw $th;
            }
    
            $path = $file->storeAs('public/uploads', $filename);
            // get the dimensions of the original image
            $original_image = storage_path().'/app/'.$path;
            list($width, $height) = getimagesize($original_image);
    
            // calculate the new dimensions
            $new_width = 400;
            $new_height = 400;
    
            // create a new image with the new dimensions
            $new_image = imagecreatetruecolor($new_width, $new_height);
    
            // copy and resize the image data from the original image into the new image
            $sourceImage = imagecreatefromjpeg($original_image);
            imagecopyresampled($new_image, $sourceImage, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
    
            // output the new image as a JPEG file
            imagejpeg($new_image, storage_path().'/app/'.$path);
            $user->profile_picture_path = $path;
        }
        $user->name = $request->input('fullname');
        $user->gender = $request->get('gender');
    
        $user->save();
    
        if ($profile_picture_is_null==null && !str_starts_with($user->profile_picture_path, 'public')) {
            if ($request->get('gender') == "male") {
                $profilepicture = "default-male";
            } else {
                $profilepicture = "default-female";
            }
            //$user->profile_picture_path = null;
        } else {
            $user->profile_picture_path = Storage::url($user->profile_picture_path);
            $profilepicture = "custom";
        }
    
        return response()->json([
            'success' => true,
            'message' => 'Your profile details have been saved successfully.',
            'profilepicture' => $profilepicture,
            'user'=> $user
        ], 200);
    }

    public function rolesAllforAddUser()
    {
        $auth = Auth::user();
        $user = User::where(['id' => $auth->id])->first();
        $domain = $user['domain'];

        $roles = Role::select('name','id')->where('domain', '=' , $domain)->get();

        return response()->json($roles, 200);
    }

    public function captureUpload(Request $request){

        $auth = Auth::user();
    
        $user = User::where(['id' => $auth->id])->first();
        $profile_picture_is_null = User::where(['profile_picture_path' => $auth->id])->first();
        $file = $request->file;
    
        if($file){
            $filename = uniqid() . '.jpg';    
            try {
                if($user->profile_picture_path){
                    Storage::delete($user->profile_picture_path);
                }
            } catch (\Throwable $th) {
                //throw $th;
            }
            $imageData = file_get_contents($file);
            Storage::put('public/uploads/' . $filename, $imageData);
            $path = 'public/uploads/'.$filename;
            // get the dimensions of the original image
            $original_image = storage_path().'/app/'.$path;
            list($width, $height) = getimagesize($original_image);
    
            // calculate the new dimensions
            $new_width = 400;
            $new_height = 400;
    
            // create a new image with the new dimensions
            $new_image = imagecreatetruecolor($new_width, $new_height);
    
            // copy and resize the image data from the original image into the new image
            $sourceImage = imagecreatefromjpeg($original_image);
            imagecopyresampled($new_image, $sourceImage, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
    
            // output the new image as a JPEG file
            imagejpeg($new_image, storage_path() .'/app/'.$path);
            $user->profile_picture_path = $path;
            $user->save();
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
}
