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
        Schema::create('cv_trainings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cv_profile_id');
            $table->string('name');
            $table->string('provider')->nullable();
            $table->date('completion_date')->nullable();
            $table->longText('description')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->foreign('cv_profile_id')->references('id')->on('cv_profiles')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cv_trainings');
    }
};
