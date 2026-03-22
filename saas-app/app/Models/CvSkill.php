<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CvSkill extends Model
{
    use HasFactory;

    protected $fillable = [
        'cv_profile_id',
        'name',
        'level',
        'order',
    ];

    /**
     * Get the CV profile that owns this skill.
     */
    public function cvProfile()
    {
        return $this->belongsTo(CvProfile::class);
    }
}
