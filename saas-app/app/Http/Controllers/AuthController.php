<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Models\RolePermissions;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use App\Http\Controllers\Controller;
use App\Models\InvoicePaymentTerm;
use Illuminate\Support\Facades\Hash;
use Auth;
use App\Models\User;
use App\Models\UserVerify;
use Validator;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Mail;
use Illuminate\Support\Facades\View;
use Storage;
use App\Models\Settings;

class AuthController extends Controller
{

	//private $apiToken;
	protected $user;

	public function __construct()
	{
		//$this->apiToken = uniqid(base64_encode(Str::random(40)));
		$this->middleware("auth:api", ["except" => ["showResetPasswordForm", "submitForgetPasswordForm", "login", "register", "logout", "verifyAccount", "checkIfEmailVerified", "me", "submitResetPasswordForm"]]);
		$this->user = new User;
	}

	/**
	 * Write code on Method
	 *
	 * @return response()
	 */
	public function showResetPasswordForm($token)
	{
		return redirect(env('APP_UI_URL') . '/#/submitresetpassword?token=' . $token);
	}

	/**
	 * Write code on Method
	 *
	 * @return response()
	 */
	public function submitForgetPasswordForm(Request $request)
	{

		$show_captcha = DB::table('settings')->select('setting_value')->where('setting_key', '=', 'show_captcha')->where('domain', '=', env('APP_DOMAIN_ADMIN'))->first();

		//echo $show_captcha->setting_value;

		if ($show_captcha->setting_value == '1') {

			if (!$request->has('recaptcha')) {
				return response()->json([
					'success' => false,
					'error' => 'Captcha verification failed (missing response)'
				], 200);
			}

			$response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
				'secret'   => env('APP_RECAPTCHA_SECRET_KEY'),
				'response' => $request->input('recaptcha'),
				'remoteip' => $request->ip(),
			]);

			$result = $response->json();

			if (!$result['success']) {
				return response()->json([
					'success' => false,
					'error' => 'Captcha verification failed'
				], 200);
				abort(422, 'Captcha verification failed');
			}

		}

		$request->validate([
			'email' => 'required|email|exists:users',
		]);

		$token = Str::random(64);

		DB::table('password_resets')->insert([
			'email' => $request->email,
			'token' => $token,
			'created_at' => Carbon::now()
		]);

		Mail::send('emails.resetpassword', ['token' => $token], function ($message) use ($request) {
			$message->to($request->email);
			$message->subject('Reset Password');
		});

		return response()->json([
			'success' => true,
			'data' => 'We have e-mailed your password reset link!'
		], 200);
	}

	/**
	 * Write code on Method
	 *
	 * @return response()
	 */
	public function submitResetPasswordForm(Request $request)
	{

		$show_captcha = DB::table('settings')->select('setting_value')->where('setting_key', '=', 'show_captcha')->where('domain', '=', env('APP_DOMAIN_ADMIN'))->first();

		//echo $show_captcha->setting_value;

		if ($show_captcha->setting_value == '1') {

			if (!$request->has('recaptcha')) {
				return response()->json([
					'success' => false,
					'error' => 'Captcha verification failed (missing response)'
				], 200);
			}

			$response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
				'secret'   => env('APP_RECAPTCHA_SECRET_KEY'),
				'response' => $request->input('recaptcha'),
				'remoteip' => $request->ip(),
			]);

			$result = $response->json();

			if (!$result['success']) {
				return response()->json([
					'success' => false,
					'error' => 'Captcha verification failed'
				], 200);
				abort(422, 'Captcha verification failed');
			}

		}

		$updatePassword = DB::table('password_resets')
			->where([
				'email' => $request->email,
				'token' => $request->token
			])
			->first();

		if (!$updatePassword) {
			return response()->json([
				'success' => false,
				'data' => 'Invalid token!'
			], 200);
			abort(422, "Invalid token!");
		}

		//$password = Str::random(64);

		$user = User::where('email', $request->email)
			->update(['password' => Hash::make($request->password)]);

		DB::table('password_resets')->where(['email' => $request->email])->delete();

		return response()->json([
			'success' => true,
			'data' => 'Password is now reseted!'
		], 200);

	}

	/**
	 *
	 * @return \Illuminate\Http\Response
	 */

	public function login(Request $request)
	{

		$validator = Validator::make($request->all(), [
			'email' => 'required|string',
			'password' => 'required|min:8',
		]);

		if ($validator->fails()) {
			return response()->json([
				'success' => false,
				'message' => $validator->messages()->toArray()
			], 500);
		}
		//User check

		$credentials = $request->only(["email", "password"]);
		$user = User::where('email', $credentials['email'])->first();

		if ($user) {
			if ($user->is_active === 1) {

				$verifyUser = UserVerify::where('user_id', $user->id)->first();

				if (auth()->attempt($credentials)) {


					if (is_null($verifyUser) || $verifyUser->verified == 1 ) {

						if (
							DB::table('domains')
								->select('domain', 'valid_before')
								->where('domain', $user->domain)
								->whereDate('valid_before_at', '<=', Carbon::now())
								->count()
						) {
							return response()->json([
								'success' => false,
								'data' => 'Username and password do not match or domain subscription is not valid or expired!'
							], 200);

						} else {
							// Login and "remember" the given user...
							//Auth::login($user, true);
							//Setting login response
							$accessToken = auth()->user()->createToken('authToken')->accessToken;
							/*$success['token'] = $this->apiToken;
							$success['name'] =  $user->name;
							return response()->json([
							'success' => true,
							'data' => $success
							], 200);*/
							$user = auth()->user();
							if(is_null($user->role_id)){
								return response()->json([
									'success' => false,
									'data' => 'Role is not assign to your account.'
								], 200);
							}
							
							
							$responseMessage = "Login Successful";
							
							return $this->respondWithToken($accessToken, $responseMessage, auth()->user());
						}

					} else {
						return response()->json([
							'success' => false,
							'data' => 'Please Verify Email!'
						], 200);
					}

				} else {
					//$success['success'] = false;
					return response()->json([
						'success' => false,
						'data' => 'Username and password do not match or domain subscription is not valid or expired!'
					], 200);

				}
			} else {
				return response()->json([
					'success' => false,
					'data' => 'Username and password do not match or domain subscription is not valid or expired!'
				], 200);
			}
		} else {
			return response()->json([
				'success' => false,
				'data' => 'Username and password do not match or domain subscription is not valid or expired!'
			], 200);
		}
	}

	public function register(Request $request)
	{

		$disable_registeration_from_others = DB::table('settings')->select('setting_value')->where('setting_key', '=', 'disable_registeration_from_others')->where('domain', '=', env('APP_DOMAIN_ADMIN'))->first();
		$show_captcha = DB::table('settings')->select('setting_value')->where('setting_key', '=', 'show_captcha')->where('domain', '=', env('APP_DOMAIN_ADMIN'))->first();

		//echo $disable_registeration_from_others->setting_value;

		if ($show_captcha->setting_value == '1') {

			if (!$request->has('recaptcha')) {
				return response()->json([
					'success' => false,
					'error' => 'Captcha verification failed (missing response)'
				], 200);
			}

			$response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
				'secret'   => env('APP_RECAPTCHA_SECRET_KEY'),
				'response' => $request->input('recaptcha'),
				'remoteip' => $request->ip(),
			]);

			$result = $response->json();

			if (!$result['success']) {
				return response()->json([
					'success' => false,
					'error' => 'Captcha verification failed'
				], 200);
				abort(422, 'Captcha verification failed');
			}

		}

		if ($disable_registeration_from_others->setting_value == '1') {
			$validator = Validator::make($request->all(), [
				'email' => 'required|string|unique:users|email',
				'name' => 'required|string',
				'gender' => 'required|string',
				'domain' => 'required|string|regex:(['.env('APP_DOMAIN_ADMIN').'])',
				'password' => 'required|min:8',
			]);
		} else {
			$validator = Validator::make($request->all(), [
				'email'          => 'required|string|unique:users|email',
				'name'           => 'required|string|max:32',
				'company_name'   => 'required|string|max:255',
				'business_id'    => 'required|string|max:32',
				'address_line_1' => 'required|string|max:255',
				'city'           => 'required|string|max:255',
				'zip'            => 'required|string|max:255',
				'gender' => 'required|string',
				'domain' => 'required|string|unique:domains,domain|regex:/^(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/',
				'password' => 'required|min:8',
			]);
		}

		if ($validator->fails()) {
			$error = $validator->errors();
			return response()->json([
				'success' => false,
				'data' => $error
			], 200);
		}

		if ($disable_registeration_from_others->setting_value == '1') {
			
		    //DB::beginTransaction();

			try {

				DB::table('users')->insert([
					['name' => $request->name, 'gender' => $request->gender, 'email' => $request->email, 'password' => Hash::make($request->password), 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s'), 'domain' => env('APP_DOMAIN_ADMIN'), 'role' => 'user', 'role_id' => 2]
				]);

				try {

					$id = DB::table('users')
						->select('id')
						->where('email', $request->email)
						->first()->id;

						try {

							$token = Str::random(64);

							DB::table('users_verify')->insert([
								['user_id' => $id, 'token' => $token, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')]
							]);


						} catch (\Throwable $th) {
								DB::rollback();
								return response()->json([
									'success' => false,
									'data' => $th->getMessage(),
									'data' => 'User is now created!'
								], 200);
						}

						$is_verified = DB::table('users_verify')
						->select('verified')
						->where('user_id', $id)
						->first()->verified;

						if ($is_verified == 0) {

							Mail::send('emails.userverify', ['token' => $token], function ($message) use ($request) {
								$message->from(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
								$message->to($request->email);
								$message->subject('Email Verification Mail');
							});
							
							return response()->json([
								'success' => true,
								'token' => $token,
								'data' => 'User is now created!'
							], 200);

						} else {
							return response()->json([
								'success' => false,
								'error' => "User is already in use"
							], 200);
						}
		
		
					} catch (\Exception $e) {
						//DB::rollback();
						// something went wrong
						return response()->json([
							'success' => false,
							'data' => $e->getMessage()
						], 200);
					}

			} catch (\Exception $e) {
				DB::rollback();
				// something went wrong
				return response()->json([
					'success' => false,
					'data' => $e->getMessage(),
					'error' => "User is already in use",
				], 200);
			}

		} else {
			
			DB::beginTransaction();

			$permissions = [
				"domain.view",
				"domain.edit",
				"domain.add",
				"domain.actions",
				"users.view",
				"users.statusChange",
				"users.changePassword",
				"users.changeRole",
				"users.addUser",
				"users.verifyUser",    
				"roles.view",
				"roles.edit",
				"roles.add",
				"roles.actions",
				"settings.manage",
			];

			try {

				DB::table('domains')->insert([
					[
						'domain' => $request->domain,
						'valid_before_at' => date('Y-m-d H:i:s', strtotime("+30 day")),
						'mobile_no' => $request->mobile_no ?? "",
						'company_name' => $request->company_name ?? "",
						'vat_id' => $request->vat_id ?? "",
						'business_id' => $request->busines_id ?? "",
						'technical_contact_email' => $request->email,
						'billing_contact_email' => $request->email,
						'company_name' => $request->company_name ?? "",
						'address_line_1' => $request->address_line_1 ?? "",
						'address_line_2' => $request->address_line_2 ?? "",
						'zip' => $request->zip ?? "",
						'city' => $request->city ?? "",
						'country' => $request->country ?? "",
						'is_admin' => false,
						'type' => "trial",
						'created_at' => date('Y-m-d H:i:s'),
						'updated_at' => date('Y-m-d H:i:s'),

					]
				]);

				$role = Role::updateOrCreate([
					"name" => "admin",
					"isActive" => true,
					"domain" => $request->domain,
				]);

				for ($i=0; $i < count($permissions); $i++) {
                
					$permission = Permission::updateOrCreate([
						"permission_name" => $permissions[$i],
						"desc" => $permissions[$i] . " desc"
					]);
					
					if ($permissions[$i] == "domain.view") {
						RolePermissions::updateOrInsert([
							"role_id" => $role->id,
							"permission_id" => $permission->id,
						],[
							"role_id" => $role->id,
							"permission_id" => $permission->id,
							"created_at" => now(),
                            "updated_at" => now(),
						]);
					} else if ($permissions[$i] == "domain.edit") {
						RolePermissions::updateOrInsert([
							"role_id" => $role->id,
							"permission_id" => $permission->id,
						],[
							"role_id" => $role->id,
							"permission_id" => $permission->id,
							"created_at" => now(),
                            "updated_at" => now(),
						]);
					} else if ($permissions[$i] == "users.view") {
						RolePermissions::updateOrInsert([
							"role_id" => $role->id,
							"permission_id" => $permission->id,
						],[
							"role_id" => $role->id,
							"permission_id" => $permission->id,
							"created_at" => now(),
                            "updated_at" => now(),
						]);
					} else if ($permissions[$i] == "users.statusChange") {
						RolePermissions::updateOrInsert([
							"role_id" => $role->id,
							"permission_id" => $permission->id,
						],[
							"role_id" => $role->id,
							"permission_id" => $permission->id,
							"created_at" => now(),
                            "updated_at" => now(),
						]);
					} else if ($permissions[$i] == "users.changePassword") {
						RolePermissions::updateOrInsert([
							"role_id" => $role->id,
							"permission_id" => $permission->id,
						],[
							"role_id" => $role->id,
							"permission_id" => $permission->id,
							"created_at" => now(),
                            "updated_at" => now(),
						]);
					} else if ($permissions[$i] == "users.changeRole") {
						RolePermissions::updateOrInsert([
							"role_id" => $role->id,
							"permission_id" => $permission->id,
						],[
							"role_id" => $role->id,
							"permission_id" => $permission->id,
							"created_at" => now(),
                            "updated_at" => now(),
						]);
					} else if ($permissions[$i] == "users.addUser") {
						RolePermissions::updateOrInsert([
							"role_id" => $role->id,
							"permission_id" => $permission->id,
						],[
							"role_id" => $role->id,
							"permission_id" => $permission->id,
							"created_at" => now(),
                            "updated_at" => now(),
						]);
					} else if ($permissions[$i] == "roles.view") {
						RolePermissions::updateOrInsert([
							"role_id" => $role->id,
							"permission_id" => $permission->id,
						],[
							"role_id" => $role->id,
							"permission_id" => $permission->id,
							"created_at" => now(),
                            "updated_at" => now(),
						]);
					} else if ($permissions[$i] == "roles.edit") {
						RolePermissions::updateOrInsert([
							"role_id" => $role->id,
							"permission_id" => $permission->id,
						],[
							"role_id" => $role->id,
							"permission_id" => $permission->id,
							"created_at" => now(),
                            "updated_at" => now(),
						]);
					} else if ($permissions[$i] == "roles.add") {
						RolePermissions::updateOrInsert([
							"role_id" => $role->id,
							"permission_id" => $permission->id,
						],[
							"role_id" => $role->id,
							"permission_id" => $permission->id,
							"created_at" => now(),
                            "updated_at" => now(),
						]);
					} else if ($permissions[$i] == "roles.actions") {
						RolePermissions::updateOrInsert([
							"role_id" => $role->id,
							"permission_id" => $permission->id,
						],[
							"role_id" => $role->id,
							"permission_id" => $permission->id,
							"created_at" => now(),
                            "updated_at" => now(),
						]);
					} else if ($permissions[$i] == "settings.manage") {
						RolePermissions::updateOrInsert([
							"role_id" => $role->id,
							"permission_id" => $permission->id,
						],[
							"role_id" => $role->id,
							"permission_id" => $permission->id,
							"created_at" => now(),
                            "updated_at" => now(),
						]);
					} else {

					}
				}

				DB::table('users')->insert([
					['name' => $request->name, 'gender' => $request->gender, 'email' => $request->email, 'password' => Hash::make($request->password), 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s'), 'domain' => $request->domain, 'role' => 'user', 'role_id' => $role->id]
				]);

				$role = Role::updateOrCreate([
					"name" => "user",
					"isActive" => true,
					"domain" => $request->domain,
				]);

				DB::commit();

				try {

					$id = DB::table('users')
						->select('id')
						->where('email', $request->email)
						->first()->id;

					$token = Str::random(64);

				DB::table('users_verify')->insert([
					['user_id' => $id, 'token' => $token, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')]
				]);

				try {
					Mail::send('emails.userverify', ['token' => $token], function ($message) use ($request) {
						$message->from(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
						$message->to($request->email);
						$message->subject('Email Verification Mail');
					});
				} catch (\Throwable $th) {
					DB::rollback();
					return response()->json([
						'success' => true,
						'token' => $token,
						'data' => 'User and domain is now created!'
					], 200);
				}
				return response()->json([
					'success' => true,
					'token' => $token,
					'data' => 'User and domain is now created!'
				], 200);


			} catch (\Exception $e) {
				DB::rollback();
				// something went wrong
				return response()->json([
					'success' => false,
					'data' => $e->getMessage()
				], 200);
			}

			} catch (\Exception $e) {
				DB::rollback();
				// something went wrong
				return response()->json([
					'success' => false,
					'data' => $e->getMessage(),
					'error' => "Domain is already in use",
				], 200);
			}
		}

	}

	/**
	 * Write code on Method
	 *
	 * @return response()
	 */
	public function verifyAccount($token)
	{
		$verifyUser = UserVerify::where('token', $token)->first();
		$status = 'error';
		$message = 'Sorry your email cannot be identified.';
		
		if (!is_null($verifyUser)) {
			if ($verifyUser->verified === 0) {
				$message = "Your e-mail is verified. You can now login.";
				$status = 'success';
			}
			if ($verifyUser->verified === 1) {
				$message = "Your e-mail is already verified. You can now login.";
				$status = 'already-verified';
			}
			UserVerify::where('token', $token)->update([
				'verified' => 1
			]);
			User::where('id', $verifyUser->user_id)->update([
				'email_verified_at' => now()
			]);
		}
		
		return redirect(env('APP_UI_URL') . '/#/verifyemail?status=' . $status . '&message=' . $message);
	}


	/**
	 * Write code on Method
	 *
	 * @return response()
	 */
	public function checkIfEmailVerified($token)
	{
		$verifyUser = UserVerify::where('token', $token)->first();
		$message = 'Sorry your email cannot be identified.';
		if (!is_null($verifyUser)) {
			if ($verifyUser->verified === 0) {
				$message = "Your e-mail is verified. You can now login.";
			}
			if ($verifyUser->verified === 1) {
				$message = "Your e-mail is already verified. You can now login.";
			}
			UserVerify::where('token', $token)->update([
				'verified' => 1
			]);
			User::where('id', $verifyUser->user_id)->update([
				'email_verified_at' => now()
			]);
		}
		return response()->json([
			'success' => true,
			'data' => $message
		], 200);
	}

	/**
	 * Logout the current user and revokes its crenedials.
	 *
	 * @return response()
	 */
	public function logout(Request $request)
	{
		$user = Auth::guard("api")->user();
		if ($user) {
			$user->token()->revoke();
			$user->token()->delete();
		}
		$responseMessage = "Successfully logged out";
		return response()->json([
			'success' => true,
			'message' => $responseMessage
		], 200);
	}

	/**
	 * Get the user's profile.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function userData(Request $request)
	{
		$data = Auth::guard("api")->user();
		//var_dump($user);
		$user = User::where(['id' => $data->id])->first();
		$user->profile_picture_path = $user->profile_picture_path?Storage::url($user->profile_picture_path):$user->profile_picture_path;
		return $user;
	}


	/**
	 * Get the user's profile name.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function me(Request $request)
	{
		$data = Auth::user();
		//var_dump($data);
		$user = User::where(['id' => $data->id])->first();

		return $user;
	}
}