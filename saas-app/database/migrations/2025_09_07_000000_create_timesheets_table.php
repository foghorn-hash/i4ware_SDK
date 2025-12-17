<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('timesheets', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id')->index();
            $table->string('nimi');
            $table->string('tyontekija')->index();
            $table->string('ammattinimike')->nullable();
            $table->enum('status', ['Luotu','Hyväksytty','Hylätty'])->default('Luotu'); // koko kortin status (valinnainen)
            $table->string('domain')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timesheets');
    }
};
