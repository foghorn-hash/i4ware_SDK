<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionsTable extends Migration
{
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('url');
            $table->string('sender');
            $table->string('customer_id');
            $table->string('timestamp');
            $table->string('language');
            $table->string('organisation_id');
            $table->string('transaction_id');
            $table->string('customer_key');
            $table->string('partner_key');
            $table->string('mac');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('transactions');
    }
}
