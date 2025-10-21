<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('timesheet_rows', function (Blueprint $table) {
            $table->time('klo_alku')->nullable()->after('pvm');
            $table->time('klo_loppu')->nullable()->after('klo_alku');
        });
    }

    public function down(): void
    {
        Schema::table('timesheet_rows', function (Blueprint $table) {
            $table->dropColumn(['klo_alku', 'klo_loppu']);
        });
    }
};
