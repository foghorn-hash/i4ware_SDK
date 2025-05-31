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

    public function __construct()
    {
        //$this->apiToken = uniqid(base64_encode(Str::random(40)));
        $this->middleware("auth:api", ["except" => ["settings"]]);
        $this->user = new User;
    }

    public function settings(Request $request)
    {

        $domain = DB::table('settings')->get();

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
}
