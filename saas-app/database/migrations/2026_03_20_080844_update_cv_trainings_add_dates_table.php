<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cv_trainings', function (Blueprint $table) {
            $table->dropColumn('completion_date');
            $table->date('start_date')->nullable()->after('provider');
            $table->date('end_date')->nullable()->after('start_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cv_trainings', function (Blueprint $table) {
            $table->date('completion_date')->nullable()->after('provider');
            $table->dropColumn('start_date');
            $table->dropColumn('end_date');
        });
    }
};
