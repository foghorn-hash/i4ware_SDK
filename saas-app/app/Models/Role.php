<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\RolePermissions;

class Role extends Model
{
    use HasFactory;
    protected $table = 'roles';

    protected $fillable = [
        'name',
        'isActive',
        'domain',
    ];
    
    public function permissions()
    {
        // return $this->hasMany(Permission::class, 'permissions');
        return $this->hasMany(RolePermissions::class, 'role_id', 'id');
    }

}
