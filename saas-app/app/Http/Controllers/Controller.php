<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use App\Models\RolePermissions;
use App\Models\Role;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

	public function respondWithToken($token, $responseMessage, $data){
		$roles = RolePermissions::where([
			'role_id' => $data->role_id
		])->pluck('permission_id');
		
		$listArray = [];
		$rolesPersmissions = Permission::whereIn('id',$roles)->pluck('permission_name');
		
		return \response()->json([
		"success" => true,
		"message" => $responseMessage,
		"data" => $data,
		"token" => $token,
		"token_type" => "bearer",
		"permissions" => $rolesPersmissions
		],200);
	}
}
