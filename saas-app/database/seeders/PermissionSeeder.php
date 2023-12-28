<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\Permission;
use App\Models\User;
use App\Models\Settings;
use App\Models\Domain;
use App\Models\Role;
use App\Models\RolePermissions;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        // default permissions 
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
            "settings.manage",
            "roles.view",
            "roles.edit",
            "roles.add",
            "roles.actions",
        ];

        if(env('APP_IS_HOUSE_USE') === false){

            $role = Role::updateOrCreate([
                "name" => "super-admin",
                "isActive" => true
            ]);
    
            for ($i=0; $i < count($permissions); $i++) {
                if ($permissions[$i] == "domain.view") {
                    $permission = Permission::updateOrCreate([
                        "permission_name" => $permissions[$i],
                        "desc" => $permissions[$i] . " desc",
                        "domain" => NULL,
                    ]);
                } else if ($permissions[$i] == "domain.edit") {
                    $permission = Permission::updateOrCreate([
                        "permission_name" => $permissions[$i],
                        "desc" => $permissions[$i] . " desc",
                        "domain" => NULL,
                    ]);
                } else if ($permissions[$i] == "users.view") {
                    $permission = Permission::updateOrCreate([
                        "permission_name" => $permissions[$i],
                        "desc" => $permissions[$i] . " desc",
                        "domain" => NULL,
                    ]);
                } else if ($permissions[$i] == "users.statusChange") {
                    $permission = Permission::updateOrCreate([
                        "permission_name" => $permissions[$i],
                        "desc" => $permissions[$i] . " desc",
                        "domain" => NULL,
                    ]);
                } else if ($permissions[$i] == "users.changePassword") {
                    $permission = Permission::updateOrCreate([
                        "permission_name" => $permissions[$i],
                        "desc" => $permissions[$i] . " desc",
                        "domain" => NULL,
                    ]);
                } else if ($permissions[$i] == "users.changeRole") {
                    $permission = Permission::updateOrCreate([
                        "permission_name" => $permissions[$i],
                        "desc" => $permissions[$i] . " desc",
                        "domain" => NULL,
                    ]);
                } else if ($permissions[$i] == "users.addUser") {
                    $permission = Permission::updateOrCreate([
                        "permission_name" => $permissions[$i],
                        "desc" => $permissions[$i] . " desc",
                        "domain" => NULL,
                    ]);
                } else if ($permissions[$i] == "roles.view") {
                    $permission = Permission::updateOrCreate([
                        "permission_name" => $permissions[$i],
                        "desc" => $permissions[$i] . " desc",
                        "domain" => NULL,
                    ]);
                } else if ($permissions[$i] == "roles.edit") {
                    $permission = Permission::updateOrCreate([
                        "permission_name" => $permissions[$i],
                        "desc" => $permissions[$i] . " desc",
                        "domain" => NULL,
                    ]);
                } else if ($permissions[$i] == "roles.add") {
                    $permission = Permission::updateOrCreate([
                        "permission_name" => $permissions[$i],
                        "desc" => $permissions[$i] . " desc",
                        "domain" => NULL,
                    ]);
                } else if ($permissions[$i] == "roles.actions") {
                    $permission = Permission::updateOrCreate([
                        "permission_name" => $permissions[$i],
                        "desc" => $permissions[$i] . " desc",
                        "domain" => NULL,
                    ]);
                } else {
                    $permission = Permission::updateOrCreate([
                        "permission_name" => $permissions[$i],
                        "desc" => $permissions[$i] . " desc",
                    ]);
                }
    
                RolePermissions::updateOrInsert([
                    "role_id" => $role->id,
                    "permission_id" => $permission->id,
                ],[
                    "role_id" => $role->id,
                    "permission_id" => $permission->id,
                ]);
            }

            $role = Role::updateOrCreate([
                "name" => "admin",
                "isActive" => true
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
                    ]);
                } else if ($permissions[$i] == "domain.edit") {
                    RolePermissions::updateOrInsert([
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ],[
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ]);
                } else if ($permissions[$i] == "users.view") {
                    RolePermissions::updateOrInsert([
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ],[
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ]);
                } else if ($permissions[$i] == "users.statusChange") {
                    RolePermissions::updateOrInsert([
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ],[
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ]);
                } else if ($permissions[$i] == "users.changePassword") {
                    RolePermissions::updateOrInsert([
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ],[
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ]);
                } else if ($permissions[$i] == "users.changeRole") {
                    RolePermissions::updateOrInsert([
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ],[
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ]);
                } else if ($permissions[$i] == "users.addUser") {
                    RolePermissions::updateOrInsert([
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ],[
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ]);
                } else if ($permissions[$i] == "roles.view") {
                    RolePermissions::updateOrInsert([
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ],[
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ]);
                } else if ($permissions[$i] == "roles.edit") {
                    RolePermissions::updateOrInsert([
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ],[
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ]);
                } else if ($permissions[$i] == "roles.add") {
                    RolePermissions::updateOrInsert([
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ],[
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ]);
                } else if ($permissions[$i] == "roles.actions") {
                    RolePermissions::updateOrInsert([
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ],[
                        "role_id" => $role->id,
                        "permission_id" => $permission->id,
                    ]);
                } else {

                }
            }

            $role = Role::updateOrCreate([
                "name" => "user",
                "isActive" => true
            ]);

        } else {

            $role = Role::updateOrCreate([
                "name" => "super-admin",
                "isActive" => true
            ]);
    
            for ($i=0; $i < count($permissions); $i++) {
                $permission = Permission::updateOrCreate([
                    "permission_name" => $permissions[$i],
                    "desc" => $permissions[$i] . " desc"
                ]);
    
                RolePermissions::updateOrInsert([
                    "role_id" => $role->id,
                    "permission_id" => $permission->id,
                ],[
                    "role_id" => $role->id,
                    "permission_id" => $permission->id,
                ]);
            }

            $role = Role::updateOrCreate([
                "name" => "user",
                "isActive" => true
            ]);

        }

        DB::beginTransaction();

        try {

            Domain::updateOrCreate([
                'domain' => env('APP_DOMAIN_ADMIN'),
                'valid_before_at' => now()->addDays(30),
                'vat_id' => '-',
                'technical_contact_email' => env('APP_DOMAIN_ADMIN_EMAIL'),
                "billing_contact_email" => env('APP_DOMAIN_ADMIN_EMAIL'),
                'mobile_no' => '-',
                'company_name' => env('APP_DOMAIN_ADMIN_COMPANY'),
                'address_line_1' => '-',
                'address_line_2' => '-',
                'zip' => '-',
                'city' => '-',
                'country' => '-',
                'is_admin' => 1,
                'type' => 'trial',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            User::updateOrCreate([
                'name' => env('APP_DOMAIN_ADMIN_FULLNAME'),
                'email' => env('APP_DOMAIN_ADMIN_EMAIL'),
                'email_verified_at' => now(),
                'domain' => env('APP_DOMAIN_ADMIN'),
                "role" => "admin",
                "role_id" => 1,
                'password' => Hash::make(env('APP_DOMAIN_ADMIN_PASSWORD')), // password
                'remember_token' => Str::random(10),
            ]);

            if(env('APP_IS_HOUSE_USE') === true){
                Settings::updateOrCreate([
                    'setting_key' => "show_captcha",
                    'setting_value' => 1,
                ]);
                
                Settings::updateOrCreate([
                    'setting_key' => "disable_registeration_from_others",
                    'setting_value' => 1,
                ]);
            } else {
                Settings::updateOrCreate([
                    'setting_key' => "show_captcha",
                    'setting_value' => 1,
                ]);
                
                Settings::updateOrCreate([
                    'setting_key' => "disable_registeration_from_others",
                    'setting_value' => 0,
                ]);
            }

            DB::commit();
    
        } catch (\Exception $e) {
            DB::rollback();
            // something went wrong
            return $e->getMessage();
        }

    }
}
