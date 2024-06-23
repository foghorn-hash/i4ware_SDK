<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('username'); // Column for the user's name
            $table->longText('message'); // Column for the message text
            $table->unsignedBigInteger('user_id')->nullable(); // Allow NULL for user_id
            $table->string('domain')->default(env('APP_DOMAIN_ADMIN'));
            $table->timestamps(); // Creates created_at and updated_at columns
            $table->softDeletes(); // Adds deleted_at column for soft deletes

            // Add foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('messages', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['user_id']);
        });

        Schema::dropIfExists('messages');
    }
};
