<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CvReference extends Model
{
    use HasFactory;

    protected $fillable = [
        'cv_profile_id',
        'name',
        'title',
        'company',
        'email',
        'phone',
        'description',
        'order',
    ];

    /**
     * Get the CV profile that owns this reference.
     */
    public function cvProfile()
    {
        return $this->belongsTo(CvProfile::class);
    }
}
