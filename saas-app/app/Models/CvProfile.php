<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CvProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'title',
        'email',
        'phone',
        'location',
        'summary',
        'github_url',
    ];

    /**
     * Get the user that owns the CV profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the skills for the CV.
     */
    public function skills()
    {
        return $this->hasMany(CvSkill::class)->orderBy('order');
    }

    /**
     * Get the work experiences for the CV.
     */
    public function experiences()
    {
        return $this->hasMany(CvExperience::class)->orderBy('order');
    }

    /**
     * Get the educations for the CV.
     */
    public function educations()
    {
        return $this->hasMany(CvEducation::class)->orderBy('order');
    }

    /**
     * Get the trainings for the CV.
     */
    public function trainings()
    {
        return $this->hasMany(CvTraining::class)->orderBy('order');
    }

    /**
     * Get the references for the CV.
     */
    public function references()
    {
        return $this->hasMany(CvReference::class)->orderBy('order');
    }
}
