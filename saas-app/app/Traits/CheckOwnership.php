<?php

namespace App\Traits;

use Illuminate\Http\Response;

trait ChecksOwnership
{
    protected function ensureOwner($model)
    {
        if ($model->user_id !== auth()->id()) {
            abort(Response::HTTP_FORBIDDEN, 'Access denied.');
        }
    }
}
