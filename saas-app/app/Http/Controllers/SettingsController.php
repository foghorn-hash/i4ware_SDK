<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Domain;
use Auth;
use Validator;
use Illuminate\Support\Facades\Hash;
use DB;
use Illuminate\Support\Carbon;

class SettingsController extends Controller
{
	protected $user;

    public function settings(Request $request)
    {
        $user = Auth::user();

        $settings = DB::table('settings')->where('domain', env('APP_DOMAIN_ADMIN'))->where('system_var', 1)->get();

        return response()->json([
            'success' => true,
            'data' => $settings
         ], 200);
    }
}
