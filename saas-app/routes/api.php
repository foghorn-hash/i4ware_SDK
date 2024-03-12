<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\StlController;
use App\Http\Controllers\GalleryController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group(['prefix' => 'users', 'middleware' => 'CORS'], function ($router) {

	Route::post('/register', [AuthController::class, 'register'])->name('register.auth');
	Route::post('/login', [AuthController::class, 'login'])->name('login.auth');
	Route::get('/userdata', [AuthController::class, 'userData'])->name('userdata.auth');
	Route::get('/checkifemailverified/{token}', [AuthController::class, 'checkIfEmailVerified'])->name('user.verify');
	Route::get('/logout', [AuthController::class, 'logout'])->name('logout.auth');
	Route::get('/me', [AuthController::class, 'me'])->name('me.auth');
	Route::post('/forget-password', [AuthController::class, 'submitForgetPasswordForm'])->name('forget.password.post'); 
	Route::post('/reset-password', [AuthController::class, 'submitResetPasswordForm'])->name('reset.password.post');
});

Route::get('/settings', [SettingsController::class, 'settings'])->name('settings.get');

Route::group(['prefix' => 'manage', 'middleware' => 'CORS'], function ($router) {

	
	Route::post('/users/change-status', [ProfileController::class, 'usersChangeStatus'])->name('manage.users-change-status');
	Route::post('/users/verify', [ProfileController::class, 'usersVerify'])->name('manage.users-verify');
	Route::post('/users/change-password', [ProfileController::class, 'usersChangePassword'])->name('manage.users-change-password');
	Route::post('/users/add-user', [ProfileController::class, 'usersAdd'])->name('manage.users-add');
	Route::get('/users', [ProfileController::class, 'users'])->name('manage.users');

    Route::get('/domains', [ProfileController::class, 'domains'])->name('manage.domains');
    Route::post('/updateDomainRecord', [ProfileController::class, 'updateDomainRecord'])->name('manage.updateDomainRecord');
    Route::post('/domains', [ProfileController::class, 'updateDomain'])->name('manage.updateDomain');
    Route::delete('/domains/{id}', [ProfileController::class, 'removeDomain'])->name('manage.removeDomain');
    Route::post('/updateSettings', [ProfileController::class, 'updateSettings'])->name('manage.updateSettings');

	Route::get('/permissions', [ProfileController::class, 'permissions'])->name('manage.permissions');
	Route::get('/role/{id}', [ProfileController::class, 'roleDelete'])->name('manage.removeRole');
	Route::get('/roles/all', [ProfileController::class, 'rolesAll'])->name('manage.rolesAll');
	Route::get('/roles/foradd', [ProfileController::class, 'rolesAllforAddUser'])->name('manage.rolesAdd');
	Route::get('/roles', [ProfileController::class, 'roles'])->name('manage.roles');
	Route::post('/roles', [ProfileController::class, 'roleAdd'])->name('manage.addRoles');
	Route::post('/roles/setRole', [ProfileController::class, 'setRole'])->name('manage.setRole');
	
	Route::get('/myprofile', [ProfileController::class, 'myprofile'])->name('manage.myprofile');
	Route::post('/myprofile', [ProfileController::class, 'myprofileSave'])->name('manage.myprofileSave');
	Route::post('/capture-upload', [ProfileController::class, 'captureUpload'])->name('manage.captureUpload');

	Route::post('/capture-upload', [ProfileController::class, 'captureUpload'])->name('manage.captureUpload');

	// Route::get('/updateSettings', [ProfileController::class, 'updateSettings'])->name('manage.updateSettings');

});

Route::group(['prefix' => 'stl', 'middleware' => 'CORS'], function ($router) {
	Route::post('/upload-stl', [StlController::class, 'uploadStlFile'])->name('stl.upload-stl');
	Route::get('/stl-items', [StlController::class, 'getStlItems'])->name('stl.stl-items');
	Route::get('/stl-item', [StlController::class, 'getStlItem'])->name('stl.stl-item');
	Route::post('/stl-file', [StlController::class, 'getStlFile'])->name('stl.stl-file');
});

Route::group(['prefix' => 'gallery', 'middleware' => 'CORS'], function ($router) {
	Route::get('/assets', [GalleryController::class, 'assets'])->name('assets.asset-items');
	Route::post('/upload-media', [GalleryController::class, 'uploadMedia'])->name('gallery.upload-media');
});
