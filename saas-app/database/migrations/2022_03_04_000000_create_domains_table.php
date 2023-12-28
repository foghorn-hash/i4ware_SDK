<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDomainsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('domains', function (Blueprint $table) {
            $table->id();
            $table->string('domain')->unique();
            $table->timestamp('valid_before_at')->nullable();
            $table->string('vat_id')->nullable();
            $table->string('technical_contact_email')->nullable();
            $table->string('billing_contact_email')->nullable();
            $table->string('mobile_no')->nullable();
            $table->string('company_name')->nullable();
            $table->string('address_line_1')->nullable();
            $table->string('address_line_2')->nullable();
            $table->string('zip')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->boolean('is_admin')->default(false);
            $table->string('type')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
        
		Schema::table('users', function (Blueprint $table) {
		 	$table->index('domain');
		 	$table->foreign('domain')->references('domain')->on('domains')->onDelete('cascade');;
		});

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('domains');
    }
}
