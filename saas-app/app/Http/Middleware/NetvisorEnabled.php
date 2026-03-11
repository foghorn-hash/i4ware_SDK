<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Settings;
use Illuminate\Support\Facades\Log;

class NetvisorEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\ResponseFactory)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\ResponseFactory
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if Netvisor is enabled in settings
        $setting = Settings::where('setting_key', 'enable_netvisor')->first();
        $isEnabled = $setting && $setting->setting_value === '1';

        if (!$isEnabled) {
            Log::warning('Netvisor API called but feature is not enabled');
            return response()->json([
                'error' => 'Netvisor is not enabled',
                'message' => 'Please enable Netvisor in settings first'
            ], 403);
        }

        return $next($request);
    }
}
