<?php
namespace App\Models;

use App\Enums\IssueStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // wrong namespace in your version
use Illuminate\Database\Eloquent\SoftDeletes;         // missing — your migration uses softDeletes()

class IssueTracker extends Model
{
    use SoftDeletes;

    protected $table = 'issue';

    protected $fillable = [
        'issue_name',
        'description',
        'status',
        'created_by',
        'assigned_to',
    ];

    protected $casts = [
        'status' => IssueStatus::class, // casts the raw string to your enum
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}