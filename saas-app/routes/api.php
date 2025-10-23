<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\DomainsController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\StlController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\NetvisorController;
use App\Http\Controllers\AtlassianSalesController;

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

Route::get('/settings', [SettingsController::class, 'settings'])->middleware('CORS')->name('settings.get');

Route::group(['prefix' => 'manage', 'middleware' => 'CORS'], function ($router) {

	
	Route::post('/users/change-status', [UsersController::class, 'usersChangeStatus'])->name('manage.users-change-status');
	Route::post('/users/verify', [UsersController::class, 'usersVerify'])->name('manage.users-verify');
	Route::post('/users/change-password', [UsersController::class, 'usersChangePassword'])->name('manage.users-change-password');
	Route::post('/users/add-user', [UsersController::class, 'usersAdd'])->name('manage.users-add');
	Route::get('/users', [UsersController::class, 'users'])->name('manage.users');

    Route::get('/domains', [DomainsController::class, 'domains'])->name('manage.domains');
    Route::post('/updateDomainRecord', [DomainsController::class, 'updateDomainRecord'])->name('manage.updateDomainRecord');
    Route::post('/domains', [DomainsController::class, 'updateDomain'])->name('manage.updateDomain');
    Route::delete('/domains/{id}', [DomainsController::class, 'removeDomain'])->name('manage.removeDomain');

	Route::get('/permissions', [RolesController::class, 'permissions'])->name('manage.permissions');
	Route::get('/role/{id}', [RolesController::class, 'roleDelete'])->name('manage.removeRole');
	Route::get('/roles/all', [RolesController::class, 'rolesAll'])->name('manage.rolesAll');
	Route::get('/roles/foradd', [RolesController::class, 'rolesAllforAddUser'])->name('manage.rolesAdd');
	Route::get('/roles', [RolesController::class, 'roles'])->name('manage.roles');
	Route::post('/roles', [RolesController::class, 'roleAdd'])->name('manage.addRoles');
	Route::post('/roles/setRole', [RolesController::class, 'setRole'])->name('manage.setRole');
	
	Route::get('/myprofile', [ProfileController::class, 'myprofile'])->name('manage.myprofile');
	Route::post('/myprofile', [ProfileController::class, 'myprofileSave'])->name('manage.myprofileSave');
	Route::post('/capture-upload', [ProfileController::class, 'captureUpload'])->name('manage.captureUpload');
	Route::post('/capture-upload', [ProfileController::class, 'captureUpload'])->name('manage.captureUpload');

	Route::post('/updateSettings', [SettingsController::class, 'updateSettings'])->name('manage.updateSettings');

});

Route::group(['prefix' => 'stl', 'middleware' => 'CORS'], function ($router) {
	Route::post('/upload-stl', [StlController::class, 'uploadStlFile'])->name('stl.upload-stl');
	Route::get('/stl-items', [StlController::class, 'getStlItems'])->name('stl.stl-items');
	Route::get('/stl-item', [StlController::class, 'getStlItem'])->name('stl.stl-item');
	Route::post('/stl-file', [StlController::class, 'getStlFile'])->name('stl.stl-file');
	Route::delete('/delete-stl', [StlController::class, 'postStlDeleteFile'])->name('stl.delete-stl'); 
	Route::post('/generate-spaceship', [StlController::class, 'generateSpaceship']);
	Route::post('/generate-cyborg', [StlController::class, 'generateCyborg']);
	Route::post('/generate-car', [StlController::class, 'generateCar']);
});

Route::group(['prefix' => 'gallery', 'middleware' => 'CORS'], function ($router) {
	Route::get('/assets', [GalleryController::class, 'assets'])->name('assets.asset-items');
	Route::post('/upload-media', [GalleryController::class, 'uploadMedia'])->name('gallery.upload-media');
	Route::delete('/photos_videos/delete', [GalleryController::class, 'deleteMedia'])->name('gallery.delete-media');
});

Route::group(['prefix' => 'chat', 'middleware' => 'CORS'], function ($router) {
	Route::post('/messages', [ChatController::class, 'message']);
	Route::get('/messages', [ChatController::class, 'getMessages']);
	Route::post('/typing', [ChatController::class, 'userTyping']);
	Route::post('/thinking', [ChatController::class, 'thinking']);
	Route::post('/upload', [ChatController::class, 'uploadMessage']);
	Route::post('/capture-upload', [ChatController::class, 'captureUpload']);
	Route::post('/upload-video', [ChatController::class, 'uploadVideo']);
	Route::post('/generate-response', [ChatController::class, 'generateResponse']);
	Route::post('/save-message', [ChatController::class, 'saveMessageToDatabase']);
	Route::post('/tts', [ChatController::class, 'synthesize']);
	Route::post('/stt', [ChatController::class, 'transcribe']);
	Route::post('/generate-image', [ChatController::class, 'generateImage']);
	Route::post('/speech', [ChatController::class, 'speech']);
	Route::post('/word/send', [ChatController::class, 'generateWordFile'])->name('chatgpt.generate.word');
	Route::post('/analyze-pdf', [ChatController::class, 'uploadPDF'])->name('pdf.upload');
});

Route::group(['prefix' => 'netvisor', 'middleware' => 'CORS'], function ($router) {
	// Invoices
	Route::get('/invoices', [NetvisorController::class, 'getSalesInvoices']);
	Route::get('/invoices/{netvisorKey}', [NetvisorController::class, 'getInvoice']);
	Route::post('/invoices', [NetvisorController::class, 'createInvoice']);

	// Customers
	Route::get('/customers', [NetvisorController::class, 'getCustomers']);
	Route::get('/customers/{customerId}', [NetvisorController::class, 'getCustomer']);
	Route::post('/customers', [NetvisorController::class, 'addCustomer']);
	Route::delete('/customers/{customerId}', [NetvisorController::class, 'deleteCustomer']);
	Route::post('/customers/office', [NetvisorController::class, 'addCustomerOffice']);
	Route::post('/customers/contact-person', [NetvisorController::class, 'addContactPerson']);

	// Products
	Route::get('/products', [NetvisorController::class, 'getProducts']);
});

// Route for Atlassian sales report
Route::group(['prefix' => 'reports', 'middleware' => 'CORS'], function ($router) {
	Route::get('/sales-report', [AtlassianSalesController::class, 'getSalesReport']);
	Route::get('/cumulative-sales', [AtlassianSalesController::class, 'getCumulativeSales']);
	Route::get('/transactions', [AtlassianSalesController::class, 'getTransactions']);
	Route::get('/combined-sales', [AtlassianSalesController::class, 'getCombinedSales']);
	Route::get('/merged-sales', [AtlassianSalesController::class, 'getMergedSales']);
	Route::get('/customer', [AtlassianSalesController::class, 'getAllCustomer']);
	Route::post('/customer', [AtlassianSalesController::class, 'addCustomer']);
	Route::post('/transaction', [AtlassianSalesController::class, 'addTransaction']);
	Route::get('/merged-monthly-sums', [AtlassianSalesController::class, 'getIncomeByMonthAllYears']);
	Route::get('/income-years', [AtlassianSalesController::class, 'getIncomeYears']);

});
