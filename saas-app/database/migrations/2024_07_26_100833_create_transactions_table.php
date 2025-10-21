<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionsTable extends Migration
{
    public function up()
    {
        Schema::create('netvisor_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('timestamp');
            $table->string('language');
            $table->string('transaction_id')->unique(); // ✅ UNIQUE index added
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('netvisor_transactions');
    }
}
