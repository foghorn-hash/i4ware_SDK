<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePhotosVideosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('photos_videos', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('asset_path');
            $table->string('file_type')->default('photo');
            $table->string('user_id');
            $table->string('domain');        
            $table->softDeletes();
            $table->timestamps();
        });
        
		Schema::table('photos_videos', function (Blueprint $table) {
		 	$table->index('domain');
		 	$table->foreign('domain')->references('domain')->on('domains')->onDelete('cascade');
		});

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('photos_videos');
    }
}
