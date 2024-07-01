<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Role;

class RolePermissions extends Model
{
    use HasFactory;
    protected $table = 'roles_permissions';
    public $timestamps = true; 

    protected $fillable = [
        'name',
        'isActive'
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'id', 'role_id');
    }

    public function permissions()
    {
        return $this->belongsToMany(RolePermissions::class, 'id', 'permission_id');
    }

}
