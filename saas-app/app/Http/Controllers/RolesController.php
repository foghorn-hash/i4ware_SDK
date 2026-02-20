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

class RolesController extends Controller
{
    protected $user;

    public function __construct()
    {
        //$this->apiToken = uniqid(base64_encode(Str::random(40)));
        $this->middleware('auth:api');
        $this->user = new User;
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
    
        $perPage = 50;

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
