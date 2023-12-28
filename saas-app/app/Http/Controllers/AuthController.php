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
use Illuminate\Support\Facades\Hash;
use Auth;
use App\Models\User;
use App\Models\UserVerify;
use Validator;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Mail;
use Illuminate\Support\Facades\View;
use Storage;

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
		return back()->with('message', 'We have e-mailed your password reset link!');
	}

	/**
	 * Write code on Method
	 *
	 * @return response()
	 */
	public function submitResetPasswordForm(Request $request)
	{

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
		}

		//$password = Str::random(64);

		$user = User::where('email', $request->email)
			->update(['password' => Hash::make($request->password)]);

		DB::table('password_resets')->where(['email' => $request->email])->delete();

		return response()->json([
			'success' => false,
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

		$disable_registeration_from_others = DB::table('settings')->select('setting_value')->where('setting_key', '=', 'disable_registeration_from_others')->first();

		//echo $disable_registeration_from_others->setting_value;

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
				'email' => 'required|string|unique:users|email',
				'name' => 'required|string',
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

				//echo "TEST!";

				//DB::commit();

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

						//echo $is_verified;

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

			try {

				DB::table('domains')->insert([
					[
						'domain' => $request->domain,
						'valid_before_at' => date('Y-m-d H:i:s', strtotime("+30 day")),
						'vat_id' => "-",
						'technical_contact_email' => $request->email,
						'billing_contact_email' => $request->email,
						'company_name' => "",
						'address_line_1' => "",
						'address_line_2' => "",
						'zip' => "",
						'city' => "",
						'country' => "",
						'is_admin' => false,
						'type' => "trial",
						'created_at' => date('Y-m-d H:i:s'),
						'updated_at' => date('Y-m-d H:i:s'),
					]
				]);

				DB::table('users')->insert([
					['name' => $request->name, 'gender' => $request->gender, 'email' => $request->email, 'password' => Hash::make($request->password), 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s'), 'domain' => $request->domain, 'role' => 'user', 'role_id' => 2]
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
		return redirect(env('APP_UI_URL') . '/#/verifyemail?token=' . $token);
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