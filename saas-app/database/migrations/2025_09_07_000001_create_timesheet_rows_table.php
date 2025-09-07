<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('timesheet_rows', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id')->index();
            // Viittaus tuntikorttiin
            $table->foreignId('timesheet_id')
                  ->constrained('timesheets')
                  ->cascadeOnDelete();

            // Järjestys rivinumerolle (vastaa UI:n id/i)
            $table->unsignedInteger('row_no')->default(1);

            // Solut
            $table->enum('status', ['Luotu','Hyväksytty','Hylätty'])->default('Luotu');
            $table->string('project')->nullable();                 // "Kustannuspaikka ja/tai Projekti"
            $table->date('pvm')->nullable();
            $table->time('klo')->nullable();                       // UI:ssa yksi kellokenttä

            // Tunnit (kvartaaliaskel soveltuu dec(5,2):een)
            $table->decimal('norm', 5, 2)->default(0);
            $table->decimal('lisat_la', 5, 2)->default(0);
            $table->decimal('lisat_su', 5, 2)->default(0);
            $table->decimal('lisat_ilta', 5, 2)->default(0);
            $table->decimal('lisat_yo', 5, 2)->default(0);
            $table->decimal('ylityo_vrk_50', 5, 2)->default(0);
            $table->decimal('ylityo_vrk_100', 5, 2)->default(0);
            $table->decimal('ylityo_vko_50', 5, 2)->default(0);
            $table->decimal('ylityo_vko_100', 5, 2)->default(0);
            $table->decimal('atv', 5, 2)->default(0);
            $table->decimal('matk', 5, 2)->default(0);

            // Päivärahat
            $table->boolean('paivaraha_osa')->default(false);
            $table->boolean('paivaraha_koko')->default(false);

            // Korvaukset
            $table->decimal('ateriakorvaus', 10, 2)->default(0);
            $table->decimal('km', 8, 2)->default(0);               // kilometrit
            $table->decimal('tyokalukorvaus', 10, 2)->default(0);

            // Selitteet / muistiinpanot
            $table->string('km_selite', 500)->nullable();
            $table->text('huom')->nullable();
            $table->text('memo')->nullable();
            $table->string('domain')->nullable();

            $table->timestamps();

            // Hyödylliset indeksit
            $table->index(['timesheet_id', 'pvm']);
            $table->index('project');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timesheet_rows');
    }
};
