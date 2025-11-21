<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Default price per user per month (in EUR with 2 decimal precision)
        Setting::updateOrCreate(
            ['setting_key' => 'price_per_user'],
            ['setting_value' => '10.00']
        );
    }
}
