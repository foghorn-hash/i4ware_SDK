<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Blade::directive('highlight', function ($expression) {
            $expression = Str::startsWith($expression, '(') ? substr($expression, 1, -1) : $expression;
    
            return "<pre><code class=\"hljs {{ $expression }}\">{!! e(\$__env->yieldContent('slot')) !!}</code></pre>";
        });
    }
}
