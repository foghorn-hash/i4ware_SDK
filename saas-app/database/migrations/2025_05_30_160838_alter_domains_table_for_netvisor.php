<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterDomainsTableForNetvisor extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->string('customer_code')->nullable()->after('id');
            $table->string('business_id')->nullable()->after('customer_code');
            $table->string('phone')->nullable()->after('business_id');
            $table->string('email')->nullable()->after('phone');
            $table->string('e_invoice_address')->nullable()->after('email');
            $table->string('e_invoice_operator')->nullable()->after('e_invoice_address');
            $table->boolean('is_active')->default(true)->after('e_invoice_operator');
            $table->string('customer_group')->nullable()->after('is_active');
            $table->string('price_group')->nullable()->after('customer_group');
            $table->string('invoice_language')->nullable()->after('price_group');
            $table->string('payment_term')->nullable()->after('invoice_language');
            $table->string('default_seller')->nullable()->after('payment_term');
            $table->string('delivery_address')->nullable()->after('default_seller');
            $table->string('delivery_postcode')->nullable()->after('delivery_address');
            $table->string('delivery_city')->nullable()->after('delivery_postcode');
            $table->string('delivery_country')->nullable()->after('delivery_city');
            $table->string('contact_person')->nullable()->after('delivery_country');
            $table->string('contact_person_phone')->nullable()->after('contact_person');
            $table->string('contact_person_email')->nullable()->after('contact_person_phone');
            $table->boolean('private_customer')->default(false)->after('contact_person_email');
            $table->timestamp('last_synced_at')->nullable()->after('vat_number');
            $table->boolean('is_synced')->default(false)->after('last_synced_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->dropColumn([
                'customer_code',
                'business_id',
                'phone',
                'email',
                'e_invoice_address',
                'e_invoice_operator',
                'is_active',
                'customer_group',
                'price_group',
                'invoice_language',
                'payment_term',
                'default_seller',
                'delivery_address',
                'delivery_postcode',
                'delivery_city',
                'delivery_country',
                'contact_person',
                'contact_person_phone',
                'contact_person_email',
                'private_customer',
                'last_synced_at',
                'is_synced',
            ]);
        });
    }
};
