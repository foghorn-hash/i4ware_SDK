<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wordbank', function (Blueprint $table) {
            $table->id();
            $table->string('document_name');
            $table->string('document_file_path');
            $table->string('domain', 255);
            $table->unsignedBigInteger('user_id');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('wordbank', function (Blueprint $table) {
            $table->foreign('domain')->references('domain')->on('domains')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wordbank');
    }
};