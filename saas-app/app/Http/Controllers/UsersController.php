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
        $this->middleware('auth:api');
        $this->user = new User;
    }

    public function users(Request $request)
    {
        $authUser = Auth::user();

        // ── Base query scoped to domain (or all for admin) ────────
        if ($authUser->role == "admin") {
            $query = User::with('roles');
        } else {
            $domain = DB::table('users')
                ->select('domain')
                ->where('id', '=', $authUser->id)
                ->first();

            $query = User::with('roles')->where('domain', '=', $domain->domain);
        }

        // ── Search filters (only applied when non-empty) ──────────
        $searchName = trim($request->input('name', ''));
        $searchEmail = trim($request->input('email', ''));

        if ($searchName !== '') {
            $query->where('name', 'LIKE', '%' . $searchName . '%');
        }

        if ($searchEmail !== '') {
            $query->where('email', 'LIKE', '%' . $searchEmail . '%');
        }

        // ── Pagination ────────────────────────────────────────────
        $perPage = (int) $request->input('per_page', 10);
        $page = (int) $request->input('page', 1);

        $total = $query->count();
        $users = $query->skip(($page - 1) * $perPage)->take($perPage)->get();

        // ── Build response ────────────────────────────────────────
        $data = [];

        foreach ($users as $user) {
            $data[] = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'gender' => $user->gender,
                'profile_picture_path' => $user->profile_picture_path,
                'domain' => $user->domain,
                'email_verified_at' => $user->email_verified_at,
                'is_active' => $user->is_active,
                'roles' => $user->roles->name ?? null,
            ];
        }

        return response()->json([
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
        ], 200);
    }

    function usersChangeStatus(Request $request)
    {
        $id = $request->id;

        $user = User::where('id', $id)->first();
        $user->is_active = $user->is_active === 1 ? false : true;
        $user->save();

        return response()->json(['success' => true], 200);
    }

    function usersVerify(Request $request)
    {
        $id = $request->id;

        $user = User::where('id', $id)->first();
        $user->email_verified_at = date('Y-m-d H:i:s');
        $user->save();

        UserVerify::where('user_id', $id)->update([
            'verified' => 1,
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        return response()->json(['success' => true], 200);
    }

    function usersChangePassword(Request $request)
    {
        $id = $request->id;
        $password = $request->password;

        $user = User::where('id', $id)->first();
        $user->password = Hash::make($password);
        $user->save();

        return response()->json(['success' => true], 200);
    }

    function usersAdd(Request $request)
    {
        $authUser = Auth::user();

        $validator = Validator::make($request->all(), [
            'email' => 'required|string|unique:users|email',
            'name' => 'required|string',
            'role' => 'required|string',
            'password' => 'required|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'data' => $validator->errors(),
            ], 200);
        }

        $role = ($request->role === 'NULL') ? null : $request->role;

        DB::table('users')->insert([
            [
                'name' => $request->name,
                'gender' => $request->gender,
                'email' => $request->email,
                'email_verified_at' => date('Y-m-d H:i:s'),
                'password' => Hash::make($request->password),
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
                'domain' => $authUser->domain,
                'role' => 'user',
                'role_id' => $role,
            ]
        ]);

        return response()->json(['success' => true, 'data' => []], 200);
    }
}