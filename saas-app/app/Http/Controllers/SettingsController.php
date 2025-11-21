<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Domain;
use App\Models\Setting;
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

    /**
     * Get price per user setting for monthly billing.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPricePerUser()
    {
        $pricePerUser = Setting::get('price_per_user', '10.00');

        return response()->json([
            'success' => true,
            'price_per_user' => (float) $pricePerUser
        ], 200);
    }

    /**
     * Update price per user setting for monthly billing.
     * Requires authentication and validates decimal input with 2 decimals.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePricePerUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'price_per_user' => 'required|numeric|min:0|regex:/^\d+(\.\d{1,2})?$/'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid price format. Must be a number with max 2 decimal places.',
                'errors' => $validator->errors()
            ], 422);
        }

        $pricePerUser = number_format((float) $request->price_per_user, 2, '.', '');

        Setting::set('price_per_user', $pricePerUser);

        return response()->json([
            'success' => true,
            'message' => 'Price per user updated successfully',
            'price_per_user' => (float) $pricePerUser
        ], 200);
    }
}
