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

        $domain = DB::table('settings')->get();

        return response()->json([
            'success' => true,
            'data' => $domain
         ], 200);
    }
}
