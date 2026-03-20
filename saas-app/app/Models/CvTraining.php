<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CvTraining extends Model
{
    use HasFactory;

    protected $table = 'cv_trainings';

    protected $fillable = [
        'cv_profile_id',
        'name',
        'provider',
        'start_date',
        'end_date',
        'description',
        'order',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the CV profile that owns this training.
     */
    public function cvProfile()
    {
        return $this->belongsTo(CvProfile::class);
    }
}
