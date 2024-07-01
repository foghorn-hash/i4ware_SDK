<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use App\Notifications\UserVerificationEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Role;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
		'domain',
        'profile_picture_path',
        'gender',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

	/**
	 * Override the default function that send a notification to verify
	 * the email after a new user register.
	 *
	 */
	public function sendEmailVerificationNotification()
    {
       $this->notify(new Notifications\UserVerificationEmail);
    }

    public function roles()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id');
    }

    public function domain()
    {
        return $this->belongsTo(Domain::class, 'domain', 'domain');
    }

    public function messages()
    {
        return $this->belongsToMany(Messages::class, 'id', 'user_id');
    }

}
