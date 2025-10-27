<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('timesheet_rows', function (Blueprint $table) {
            // Удаляем старые boolean поля
            $table->dropColumn(['paivaraha_osa', 'paivaraha_koko']);

            // Добавляем новое ENUM поле
            $table->enum('paivaraha', ['ei', 'osa', 'koko'])->default('ei')->after('matk');
        });
    }

    public function down(): void
    {
        Schema::table('timesheet_rows', function (Blueprint $table) {
            // Удаляем новое поле
            $table->dropColumn('paivaraha');

            // Возвращаем старые boolean поля
            $table->boolean('paivaraha_osa')->default(0)->after('matk');
            $table->boolean('paivaraha_koko')->default(0)->after('paivaraha_osa');
        });
    }
};
