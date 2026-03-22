<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CvExperience extends Model
{
    use HasFactory;

    protected $fillable = [
        'cv_profile_id',
        'company',
        'role',
        'start_date',
        'end_date',
        'currently_employed',
        'description',
        'order',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'currently_employed' => 'boolean',
    ];

    /**
     * Get the CV profile that owns this experience.
     */
    public function cvProfile()
    {
        return $this->belongsTo(CvProfile::class);
    }
}
